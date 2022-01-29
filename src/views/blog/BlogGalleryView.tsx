import { faArrowCircleLeft, faArrowCircleRight, faCamera, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useMemo, useState } from 'react'
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
import { FetchContext } from '../../lib/useFetch'
import useIntersectionObserver from '../../lib/useIntersectionObserver'
import useQueue, { QueueContext } from '../../lib/useQueue'
import useURLSearchParams from '../../lib/useURLSearchParams'
import useAuthorization from '../../store/useAuthorization'
import './BlogGalleryView.css'

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

const removeBlogEntriesMutation = graphql`
  mutation Mutation($ids: [ID!]!) {
    removeBlogEntries(ids: $ids) {
      count
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

  const { fetch } = useContext(FetchContext)

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
                <FileInput label="Choose an Image..." onFilesChange={setFiles} accept="image/*" capture="environment" icon={faCamera} />
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
  entry: PagedBlogEntry
  reload: () => void
}

const BlogImage: React.FC<BlogImageProps> = props => {
  const {
    entry,
    reload,
  } = props

  const { id, imageFileExtension } = entry
  const createURL = (kind: 'image' | 'preview') => `${process.env.REACT_APP_API_URL}/blog/entries/${id}/${kind}.${imageFileExtension}`
  const imageFileURL = createURL('image')
  const imageFileURLPreview = createURL('preview')

  const isAdmin = useAuthorization('admin')

  const [image, setImage] = useState<HTMLElement | null>(null)
  const imageVisible = useIntersectionObserver(image, { once: true })

  const { useHistory, useLocation } = useContext(A.Context)
  const history = useHistory()
  const location = useLocation()
  const search = useURLSearchParams(location?.search)

  const { showModal } = useContext(Modal.Portal)
  useEffect(() => {
    if (search.entry !== entry.id || !image) {
      return
    }

    (async () => {
      image?.scrollIntoView({
        // behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })

      const [modal, resolve] = showModal<string | undefined>(
        <Image className="blog-entry-image">
          <Image.Caption>
            <H4>{entry.story}</H4>
            <H5>{entry.title}</H5>
            <P style={{ whiteSpace: 'pre-wrap' }} linkify>{entry.message}</P>
          </Image.Caption>
          <Button onClick={() => resolve(entry.prevEntryId)} className="go-left" disabled={!entry.prevEntryId}>
            <Icon icon={faArrowCircleLeft} />
          </Button>
          <Button onClick={() => resolve(entry.nextEntryId)} className="go-right" disabled={!entry.nextEntryId}>
            <Icon icon={faArrowCircleRight} />
          </Button>
          <img src={imageFileURL} alt="" />
        </Image>
      )

      const newEntryId = await modal
      if (newEntryId) {
        history?.replace(`?entry=${newEntryId}`)
      } else {
        history?.replace(`?`)
      }
    })()
  }, [search.entry, entry, showModal, imageFileURL, history, image])

  const [imageAllowed, handleLoad] = useQueue(25, !imageVisible)

  const [removeBlogEntries] = useMutation<Mutation>({
    query: removeBlogEntriesMutation,
  })
  const handleDeleteClick = useMemo(() => {
    return async () => {
      await removeBlogEntries({ ids: [entry.id] })

      reload()
    }
  }, [entry, removeBlogEntries, reload])

  return (
    <Image innerRef={setImage} dimension="128x128" style={{ display: 'inline-block', margin: '0.2rem' }}>
      {isAdmin && (
        <Button onClick={handleDeleteClick} cross />
      )}
      {imageVisible && imageAllowed && (
        <A href={`?entry=${entry.id}`} replace>
          <img src={imageFileURLPreview} alt="" onLoad={handleLoad} onError={handleLoad} />
        </A>
      )}
    </Image>
  )
}

type BlogGroupProps = {
  date: string
  entries: PagedBlogEntry[]
  reload: () => void
}

const BlogGroup: React.FC<BlogGroupProps> = props => {
  const {
    date,
    entries,
    reload,
  } = props

  return (
    <Div>
      {/* <A href={`?date=${date}`} replace>
        <H5 date={date} />
      </A> */}
      <H5 date={date} />
      <Div>
        {entries.map(entry => (
          <BlogImage key={entry.id} entry={entry} reload={reload} />
        ))}
      </Div>
    </Div>
  )
}

type PagedBlogEntry = BlogEntry & {
  prevEntryId?: string
  nextEntryId?: string
}

const BlogGalleryView: React.FC = props => {
  const isAdmin = useAuthorization('admin')

  const [data, error, , retry] = useQuery<Query>({
    query: blogEntriesQuery,
  })

  const { useErrorNotificationEffect } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  const groups = useMemo(() => {
    return data?.blogEntries
      ?.map((entry, index, entries) => {
        return {
          ...entry,
          prevEntryId: entries[index - 1]?.id,
          nextEntryId: entries[index + 1]?.id,
        }
      })
      ?.reduce((groups, entry) => {
        const date = new Date(entry.createdAt as any)
        const dateISOString = date.toISOString()
        const dateDay = dateISOString.slice(0, 'yyyy-MM-dd'.length)

        groups[dateDay] = groups[dateDay] ?? []
        groups[dateDay].push(entry)

        return groups
      }, {} as Record<string, PagedBlogEntry[]>)
  }, [data?.blogEntries])

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

        <QueueContext.Provider>
          {Object.entries(groups ?? {}).map(([date, entries]) => (
            <BlogGroup key={date} date={date} entries={entries} reload={retry} />
          ))}
        </QueueContext.Provider>
      </Container>
    </Section>
  )
}

export default React.memo(BlogGalleryView)
