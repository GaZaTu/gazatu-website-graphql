import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BlogEntry, BlogEntryInput, Mutation, Query } from '../../assets/schema.gql'
import AppForm, { useAppForm } from '../../lib/AppForm'
import A from '../../lib/bulma/A'
import Button from '../../lib/bulma/Button'
import Container from '../../lib/bulma/Container'
import Control from '../../lib/bulma/Control'
import Field from '../../lib/bulma/Field'
import FileInput from '../../lib/bulma/FileInput'
import Icon from '../../lib/bulma/Icon'
import Image from '../../lib/bulma/Image'
import Input from '../../lib/bulma/Input'
import Level from '../../lib/bulma/Level'
import Modal from '../../lib/bulma/Modal'
import Notification from '../../lib/bulma/Notification'
import Section from '../../lib/bulma/Section'
import { Div, H1, H4, H5, P } from '../../lib/bulma/Text'
import { graphql } from '../../lib/graphql'
import useMutation from '../../lib/graphql/useMutation'
import useQuery from '../../lib/graphql/useQuery'
import readFile from '../../lib/readFile'
import useURLSearchParams from '../../lib/useURLSearchParam'
import useAuthorization from '../../store/useAuthorization'

const blogEntriesQuery = graphql`
  query Query {
    blogEntries {
      id
      story
      title
      message
      imageFileExtension
      createdAt
    }
  }
`

const saveBlogEntriesMutation = graphql`
  mutation Mutation($input: [BlogEntryInput!]!) {
    saveBlogEntries(input: $input) {
      ids
    }
  }
`

type BlogUploadFormProps = {
  onSubmit: () => void
  onCancel: () => void
}

const BlogUploadForm: React.FC<BlogUploadFormProps> = props => {
  const { pushError } = useContext(Notification.Portal)
  const [saveBlogEntries] = useMutation<Mutation>({
    query: saveBlogEntriesMutation,
  })

  const defaultValues = useMemo(() => {
    return {
      story: new Date().toISOString().slice(0, 'yyyy-MM-dd'.length),
      title: new Date().toISOString().slice('yyyy-MM-dd'.length + 1),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const form = useAppForm({
    defaultValues,
    allowUntouched: true,
  })
  const {
    handleSubmit,
    canSubmit,
    submitting,
  } = form

  const [imageAsDataURL, setImageAsDataURL] = useState('')
  const [files, setFiles] = useState<File[]>([])
  useEffect(() => {
    (async () => {
      if (!files[0]) {
        return
      }

      const imageAsDataURL = await readFile(files[0], { how: 'readAsDataURL', encoding: 'base64' })
      setImageAsDataURL(imageAsDataURL)
    })()
  }, [files])

  const onSubmit = async (values: BlogEntryInput) => {
    try {
      const result = await saveBlogEntries({ input: [values] })
      const id = result.saveBlogEntries?.ids?.[0]
      const file = files[0]
      const fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)

      await fetch!(`/blog/entries/${id}/image.${fileExtension.toLowerCase()}`, {
        method: 'POST',
        body: file,
      })

      props.onSubmit()
    } catch (error) {
      pushError(error)
    }
  }

  return (
    <Image style={{ minHeight: '500px', backgroundColor: '#00000070' }}>
      <Section style={{ position: 'absolute', width: '100%', backgroundColor: files[0] ? '#00000035' : undefined }}>
        <Container>
          <H1 kind="title">Upload Blog Entry</H1>

          <AppForm form={form} onSubmit={handleSubmit(onSubmit)}>
            <Field>
              <Control>
                <FileInput label="Choose a file..." onFilesChange={setFiles} />
              </Control>
            </Field>

            <Field label="Story">
              <Control>
                <Input name="story" type="text" required minLength={3} />
              </Control>
            </Field>

            <Field label="Title">
              <Control>
                <Input name="title" type="text" required minLength={3} />
              </Control>
            </Field>

            <Field label="Message">
              <Control>
                <Input name="message" type="text" />
              </Control>
            </Field>

            <Field>
              <Button.Group>
                <Button type="submit" color="primary" disabled={!canSubmit || !files[0]} loading={submitting}>Submit</Button>
                <Button type="button" onClick={props.onCancel} loading={submitting}>Cancel</Button>
              </Button.Group>
            </Field>
          </AppForm>
        </Container>
      </Section>

      <img src={imageAsDataURL} alt="" />
    </Image>
  )
}

type BlogImageProps = {
  entry: BlogEntry
  queue: [string[], React.Dispatch<React.SetStateAction<string[]>>]
}

const BlogImage: React.FC<BlogImageProps> = props => {
  const {
    entry,
    queue: [queue, setQueue],
  } = props

  const { id, imageFileExtension } = entry
  const createURL = (kind: 'image' | 'preview') => `${process.env.REACT_APP_API_URL}/blog/entries/${id}/${kind}.${imageFileExtension}`
  const imageFileURL = createURL('image')
  const imageFileURLPreview = createURL('preview')

  const isAdmin = useAuthorization('admin')

  const imageRef = useRef<HTMLElement>(null)

  const { useHistory, useLocation } = useContext(A.Context)
  const history = useHistory()
  const location = useLocation()
  const search = useURLSearchParams(location?.search)

  const { showModal } = useContext(Modal.Portal)
  useEffect(() => {
    if (search.entry !== entry.id) {
      return
    }

    (async () => {
      imageRef.current?.scrollIntoView({
        // behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })

      const [modal] = showModal(
        <Image>
          <Image.Caption>
            <H4>{entry.story}</H4>
            <H5>{entry.title}</H5>
            <P>{entry.message}</P>
          </Image.Caption>
          <img src={imageFileURL} alt="" />
        </Image>
      )

      await modal

      history?.replace('?')
    })()
  }, [search.entry, entry, showModal, imageFileURL, history])

  const [loadImg, setLoadImg] = useState(false)
  useEffect(() => {
    if (loadImg) {
      return
    }

    setQueue(queue => {
      if (queue.length > 5) {
        return queue
      }

      setLoadImg(true)
      setTimeout(() => {
        setQueue(queue => queue.filter(o => o !== id))
      }, 250)

      return [...queue, id!]
    })
  }, [id, loadImg, setLoadImg, queue, setQueue])

  return (
    <Image innerRef={imageRef} dimension="128x128" style={{ display: 'inline-block', margin: '0.2rem' }}>
      {isAdmin && (
        <Button onClick={() => {}} cross />
      )}
      {loadImg && (
        <A href={`?entry=${entry.id}`} replace>
          <img src={imageFileURLPreview} alt="" loading="lazy" />
        </A>
      )}
    </Image>
  )
}

const BlogGalleryView: React.FC = props => {
  const isAdmin = useAuthorization('admin')

  const [data, error, , retry] = useQuery<Query>({
    query: blogEntriesQuery,
  })

  const { useErrorNotificationEffect } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  const queue = useState([] as string[])

  const groups = data?.blogEntries?.reduce((groups, entry) => {
    const date = new Date(entry.createdAt as any)
    const dateISOString = date.toISOString()
    const dateDay = dateISOString.slice(0, 'xx-xx-xxxx'.length)

    groups[dateDay] = groups[dateDay] ?? []
    groups[dateDay].push(entry)

    return groups
  }, {} as Record<string, BlogEntry[]>)

  const { showModal } = useContext(Modal.Portal)
  const handleUploadClick = useMemo(() => {
    return async () => {
      const [modal, resolve, reject] = showModal(
        <BlogUploadForm onSubmit={() => resolve(undefined)} onCancel={() => reject()} />
      )

      await modal

      retry()
    }
  }, [showModal, retry])

  return (
    <Section>
      <Container>
        {isAdmin && (
          <Level mobile>
            <Level.Left />
            <Level.Right>
              <Level.Item>
                <Button onClick={handleUploadClick}>
                  <Icon icon={faCloudUploadAlt} />
                </Button>
              </Level.Item>
            </Level.Right>
          </Level>
        )}

        {Object.entries(groups ?? {}).map(([dateDay, entries]) => (
          <Div key={dateDay}>
            <H5 date={dateDay} />
            <Div>
              {entries.map(entry => (
                <BlogImage key={entry.id} entry={entry} queue={queue} />
              ))}
            </Div>
          </Div>
        ))}
      </Container>
    </Section>
  )
}

export default React.memo(BlogGalleryView)
