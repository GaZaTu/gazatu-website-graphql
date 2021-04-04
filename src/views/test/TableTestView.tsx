import React from 'react'
import { useLocation } from 'react-router-dom'
import useFetch from 'use-http'
import A from '../../bulma/A'
import Button from '../../bulma/Button'
import Container from '../../bulma/Container'
import Section from '../../bulma/Section'
import Table from '../../bulma/Table'
import { H1, H2, Span } from '../../bulma/Text'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

type Track = {
  ID: number
  link: string
  name: String
  videoType: 1
  trackType: 'Single'
  duration: number
  available: boolean
  published: string
  notes: string | null
  addedBy: number
  addedOn: string
  lastEdit: string | null
  authors: number[]
  tags: number[]
  fans: string
  parsedLink: string
  favourites: number
  youtubeReuploads: string[]
}

type TrackList = {
  statusCode: number
  timestamp: number
  data: Track[]
}

const TableTestView: React.FC = props => {
  const location = useLocation()
  const {
    loading,
    error,
    data,
  } = useFetch<TrackList>('https://supinic.com/api/track/search', {}, [])

  return (
    <Section>
      <Container>
        {true && (
          <H1 kind="title" documentTitle>Gachi-List</H1>
        )}
        {location.search && (
          <H2 kind="subtitle">{location.search}</H2>
        )}

        <Table className="is-unpadded" data={data?.data} bordered fullwidth loading={loading} initialState={{ pageSize: 25 }} canSelectRows={false}>
          <Table.Toolbar>
            <Button>123</Button>
            <Button>456</Button>
          </Table.Toolbar>

          <Table.Column Header="🔁" accessor="" disableSortBy />

          <Table.Column Header="Name" accessor="name"
            Cell={({ value: name, row }) => (
              <A href={row.original.parsedLink} external>{name}</A>
            )}
          />

          <Table.Column Header="Published" accessor="published"
            Cell={({ value: published }) => (
              <Span>{published && dateFormat.format(new Date(published))}</Span>
            )}
          />

          <Table.Column Header="Author" accessor="authors"
            Cell={({ value: authors }) => (
              authors?.map((author: number) => (
                <A key={author} href={`https://supinic.com/track/author/${author}`} external>{author}</A>
              ))
            )}
          />

          <Table.Column Header="Favs" accessor="favourites" />

          <Table.Column Header="ID" accessor="ID"
            Cell={({ value: ID }) => (
              <A href={`https://supinic.com/track/detail/${ID}`} external>{ID}</A>
            )}
          />
        </Table>
      </Container>
    </Section>
  )
}

export default React.memo(TableTestView)
