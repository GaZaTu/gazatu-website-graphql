import React, { useContext, useEffect, useMemo, useState } from 'react'
import Container from '../../bulma/Container'
import Image from '../../bulma/Image'
import Modal from '../../bulma/Modal'
import Notification from '../../bulma/Notification'
import Section from '../../bulma/Section'
import { Div, P } from '../../bulma/Text'
import { graphql } from '../../graphql'
import { BlogEntry, Query } from '../../graphql/schema.gql'
import useQuery from '../../graphql/useQuery'

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

  const { showModal } = useContext(Modal.Portal)

  const handleClick = useMemo(() => {
    return async () => {
      const [modal] = showModal(
        <Image>
          <img src={imageFileURL} alt="" />
        </Image>
      )

      await modal
    }
  }, [showModal, imageFileURL])

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
    <Image dimension="128x128" onClick={handleClick} style={{ display: 'inline-block', margin: '0.2rem', cursor: 'pointer' }}>
      {loadImg && (
        <img src={imageFileURLPreview} alt="" loading="lazy" />
      )}
    </Image>
  )
}

const BlogGalleryView: React.FC = props => {
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
  }, {} as { [key: string]: BlogEntry[] })

  return (
    <Section>
      <Container>
        {Object.entries(groups ?? {}).map(([dateDay, entries]) => (
          <Div key={dateDay}>
            <P>{dateDay}</P>
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
