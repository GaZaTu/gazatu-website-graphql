import React, { useContext, useMemo } from 'react'
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

const BlogImage: React.FC<{ entry: BlogEntry }> = props => {
  const { entry } = props
  const { id, imageFileExtension } = entry
  const imageFileURL = `${process.env.REACT_APP_API_URL}/blog/entries/${id}/image.${imageFileExtension}`
  const imageFileURLPreview = `${imageFileURL}?width=128&height=128`

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

  return (
    <Image dimension="128x128" onClick={handleClick} style={{ display: 'inline-block', margin: '0.2rem', cursor: 'pointer' }}>
      <img src={imageFileURLPreview} alt="" loading="lazy" />
    </Image>
  )
}

const BlogGalleryView: React.FC = props => {
  const [data, error, , retry] = useQuery<Query>({
    query: blogEntriesQuery,
  })

  const { useErrorNotificationEffect } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

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
                <BlogImage entry={entry} />
              ))}
            </Div>
          </Div>
        ))}
      </Container>
    </Section>
  )
}

export default React.memo(BlogGalleryView)
