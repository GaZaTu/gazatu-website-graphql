import { createStyles, Divider, IconButton, makeStyles, TextField, Toolbar } from '@material-ui/core'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'
import { useSnackbar } from 'notistack'
import React, { useContext, useMemo, useState } from 'react'
import Form from '../../lib/Form'
import { graphql } from '../../lib/graphql'
import { BlogEntry, BlogEntryInput, IDsResult, Mutation, Query } from '../../lib/graphql/schema.gql'
import useMutation from '../../lib/graphql/useMutation'
import useQuery from '../../lib/graphql/useQuery'
import { navigate } from '../../lib/hookrouter'
import FormTextField from '../../lib/mui/FormTextField'
import ProgressIconButton from '../../lib/mui/ProgressIconButton'
import readFile from '../../lib/readFile'
import useAuthorization from '../../lib/useAuthorization'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import { FetchContext } from '../../lib/createFetch'

const useBlogEntryInputInputStyles =
  makeStyles(theme =>
    createStyles({
      image: {
        [theme.breakpoints.up('md')]: {
          maxHeight: '666px',
        },
        [theme.breakpoints.down('md')]: {
          maxWidth: 'calc(100% + 24px + 24px)',
          marginLeft: '-24px',
        },
      },
    }),
  )

const BlogEntryInputInput: React.FC<BlogEntryInput & { idx: number, readOnly?: boolean }> = props => {
  const { idx, readOnly, ...entry } = props
  const styles = useBlogEntryInputInputStyles()
  const imageSrc = entry.id ? `${process.env.REACT_APP_API_URL}/blog/entries/${entry.id}/image.${entry.imageFileExtension}` : entry.imageAsDataURL

  const handleDelete =
    (customControlProps: (key: any) => { value: any, onChange: (v: any) => void }) =>
      () => {
        const { value, onChange } = customControlProps('entries')

        onChange(value.filter((e: any) => e.title !== entry.title))
      }

  return (
    <div style={{ margin: '10px 0px' }}>
      <div>
        <img src={imageSrc!} className={styles.image} />
      </div>
      <Form.Context.Consumer>
        {({ customControlProps }) => (
          <div style={{ display: 'flex' }}>
            <span style={{ flexGrow: 1 }} />
            <IconButton onClick={handleDelete(customControlProps)} style={{ display: readOnly ? 'none' : undefined }}>
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </Form.Context.Consumer>
      <div>
        <FormTextField type="text" name={`entries.${idx}.title`} label="Title" variant="standard" style={{ width: '100%' }} inputProps={{ readOnly }} required />
      </div>
      <div>
        <FormTextField type="text" name={`entries.${idx}.message`} label="Message" variant="standard" style={{ width: '100%' }} inputProps={{ readOnly }} multiline />
      </div>
    </div>
  )
}

const BlogStoryForm: React.FC<{ story: string }> = props => {
  const { story } = props
  const isNew = story === 'new'
  const [isAdmin] = useAuthorization('admin')
  const readOnly = !isAdmin || !isNew
  const { fetch } = useContext(FetchContext)

  const query = graphql`
    query Query($story: String!, $isNew: Boolean!) {
      blogEntries(story: $story) @skip(if: $isNew) {
        id
        story
        title
        message
        imageFileExtension
      }
    }
  `

  const mutation = graphql`
    mutation Mutation($input: [BlogEntryInput!]!) {
      saveBlogEntries(input: $input) {
        ids
      }
    }
  `

  const variables = useMemo(() => {
    return {
      story,
      isNew,
    }
  }, [story, isNew])

  const [data, error, loading, retry] = useQuery<Query>({
    query,
    variables,
  })

  const [saveBlogEntries] = useMutation<Mutation>({
    query: mutation,
  })

  const initialValues = useMemo(() => {
    return {
      story: data?.blogEntries?.[0].story ?? new Date().toISOString().slice(0, 'yyyy-MM-dd'.length),
      entries: (data?.blogEntries ?? []) as (BlogEntry & { file?: File })[],
    }
  }, [data])

  const { enqueueSnackbar } = useSnackbar()

  const handleImageInputChange = useMemo(() => {
    return (customControlProps: (name: string) => { value: any, onChange: (v: any) => void }) =>
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) {
          return
        }

        const imageAsDataURL = await readFile(file, { how: 'readAsDataURL', encoding: 'base64' })
        const blogEntry = { imageAsDataURL, title: new Date().toISOString().slice('yyyy-MM-dd'.length + 1), file }

        const { value, onChange } = customControlProps('entries')
        onChange([blogEntry, ...value])

        event.target.value = ''
      }
  }, [])

  const handleSubmit = useMemo(() => {
    return async (values: typeof initialValues) => {
      try {
        const input = values.entries.map(e => ({
          story: values.story,
          title: e.title,
          message: e.message,
        }))
        const result = await saveBlogEntries({ input })

        for (let i = 0; i < values.entries.length; i++) {
          const { file } = values.entries[i]
          const id = result.saveBlogEntries?.ids?.[i]

          if (file) {
            const fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)

            await fetch!(`/blog/entries/${id}/image.${fileExtension.toLowerCase()}`, {
              method: 'POST',
              body: file,
            })
          }
        }

        if (isNew) {
          navigate(`/blog/stories/${values.story}`)
        } else {
          retry()
        }
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [])

  return (
    <Form initialValues={initialValues} onSubmit={handleSubmit}>
      <Form.Context.Consumer>
        {({ formState, submit, customControlProps }) => (
          <Toolbar>
            <FormTextField type="text" name="story" label="Story" variant="standard" inputProps={{ readOnly }} required />

            <span style={{ flexGrow: 1 }} />

            <input type="file" id="image-input" accept="image/*" capture="environment" onChange={handleImageInputChange(customControlProps)} readOnly={!isNew} hidden />
            <label htmlFor="image-input">
              <IconButton color="primary" component="span" disabled={!isNew}>
                <PhotoCameraIcon />
              </IconButton>
            </label>

            <ProgressIconButton
              type="button"
              color="primary"
              onClick={submit}
              disabled={!formState.isSubmittable || readOnly}
              loading={formState.isSubmitting || loading}
            >
              <SaveIcon />
            </ProgressIconButton>
          </Toolbar>
        )}
      </Form.Context.Consumer>

      <Form.Context.Consumer>
        {({ values }) => (
          values.entries.map((entry: any, i: number) => (
            <React.Fragment key={i}>
              <Divider />
              <BlogEntryInputInput idx={i} {...entry} readOnly={readOnly} />
            </React.Fragment>
          ))
        )}
      </Form.Context.Consumer>
    </Form>
  )
}

const BlogStoryView: React.FC<{ name: string }> = ({ name }) => {
  useDocumentAndDrawerTitle('Blog - Story')

  return (
    <div>
      <BlogStoryForm story={name} />
    </div>
  )
}

export default BlogStoryView
