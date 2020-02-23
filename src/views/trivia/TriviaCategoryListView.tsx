import React from 'react'
import { graphql } from '../../lib/graphql/graphql'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import useDrawerWithoutPadding from '../../lib/useDrawerWithoutPadding'
import AppTable from '../../app/AppTable'
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@material-ui/core'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import { MUIDataTableOptions } from 'mui-datatables'
import useQuery from '../../lib/graphql/useQuery'
import NavLink from '../../lib/mui/NavLink'
import { Query, Mutation, TriviaCategory } from '../../lib/graphql/schema.gql'
import { useQueryParams } from '../../lib/hookrouter'
import useAuthorization from '../../lib/useAuthorization'
import useMutation from '../../lib/graphql/useMutation'
import Check from '@material-ui/icons/Check'
import Delete from '@material-ui/icons/Delete'
import CallMerge from '@material-ui/icons/CallMerge'
import { dispatchReloadTriviaCounts } from '../../app/AppSidebar'
import VerifiedUser from '@material-ui/icons/VerifiedUserOutlined'
import Form from '../../lib/Form'
import ProgressButton from '../../lib/mui/ProgressButton'
import FormAutocomplete from '../../lib/mui/FormAutocomplete'
import useShowPromptDialog from '../../lib/useShowPromptDialog'

const TriviaCategoryListView: React.FC = () => {
  useDocumentAndDrawerTitle('Trivia Categories')
  useDrawerWithoutPadding()

  const [{ verified, disabled }] = useQueryParams()
  const [isTriviaAdmin] = useAuthorization('trivia-admin')

  const query = graphql`
    query Query($verified: Boolean, $disabled: Boolean) {
      triviaCategories(verified: $verified, disabled: $disabled) {
        id
        name
        submitter
        verified
        disabled
        createdAt
        updatedAt
      }
    }
  `

  const [variables, setVariables] = React.useState({
    verified: undefined as boolean | undefined,
    disabled: false as boolean | undefined,
  })

  React.useEffect(() => {
    setVariables(variables => ({
      ...variables,
      verified,
      disabled,
    }))
  }, [setVariables, verified, disabled])

  const [data, error, loading, retry] = useQuery<Query>({
    query,
    variables,
  })

  const [search, setSearch] = React.useState('')
  const [selectedIndexes, setSelectedIndexes] = React.useState<number[]>([])

  const tableOptions = React.useMemo<MUIDataTableOptions>(() => {
    return {
      serverSide: false,
      count: data?.triviaCategories?.length,
      filter: false,
      rowsPerPageOptions: [20],
      rowsPerPage: 20,
      responsive: 'scrollMaxHeight',
      onTableChange: (action, tableState) => {
        switch (action) {
          case 'changePage':
            setSelectedIndexes([])
            break
        }
      },
      searchText: search,
      onSearchChange: setSearch,
      customToolbar: () => <CustomToolbar />,
      selectableRows: isTriviaAdmin ? 'multiple' : 'none',
      isRowSelectable: () => isTriviaAdmin,
      onRowsSelect: (clickedRows, selectedRows) => {
        setSelectedIndexes(selectedRows.slice(0, 20).map(r => r.dataIndex))
      },
      rowsSelected: selectedIndexes,
      customToolbarSelect: () => <CustomSelectedItemsToolbar reload={retry} selectedCategories={selectedIndexes.map(i => data?.triviaCategories![i])} setSelectedIndexes={setSelectedIndexes} />,
    }
  }, [data, setSelectedIndexes, isTriviaAdmin, retry, selectedIndexes, setSearch, search])

  if (data) {
    return (
      <div>
        <AppTable className="fullscreen" title="" data={data.triviaCategories!} options={tableOptions}>
          <AppTable.Column name="id" options={{ display: 'excluded' }} />
          <AppTable.Column name="" options={{ empty: true, filter: false, sort: false }}>
            {(_, meta) => (
              <NavLink href={`/trivia/categories/${meta.rowData?.[0]}`}>
                <IconButton size="small">
                  <OpenInBrowser />
                </IconButton>
              </NavLink>
            )}
          </AppTable.Column>
          <AppTable.Column name="name" label="Name" />
          <AppTable.Column name="submitter" label="Submitter" />
          <AppTable.Column name="updatedAt" label="Updated">
            {v => new Date(v).toLocaleDateString()}
          </AppTable.Column>
          <AppTable.Column name="verified" label="⠀">
            {v => v && (<VerifiedUser />)}
          </AppTable.Column>
        </AppTable>
      </div>
    )
  } else if (error) {
    return (
      <div>
        <pre>{error.message}</pre>
        <button onClick={retry} disabled={loading}>Retry</button>
      </div>
    )
  } else {
    return (
      <div>Loading...</div>
    )
  }
}

export default TriviaCategoryListView

const CustomToolbar: React.FC = () => {
  return (
    <React.Fragment>

    </React.Fragment>
  )
}

const CustomSelectedItemsToolbar: React.FC<{ reload: () => void, selectedCategories: TriviaCategory[], setSelectedIndexes: React.Dispatch<React.SetStateAction<number[]>> }> = props => {
  const { reload, selectedCategories, setSelectedIndexes } = props
  const [isTriviaAdmin] = useAuthorization('trivia-admin')
  const showPromptDialog = useShowPromptDialog()

  const getSelectedIds = React.useMemo(() => {
    return () =>
      selectedCategories.map(q => q.id)
  }, [selectedCategories])

  const verifyTriviaCategoriesMutation = graphql`
    mutation Mutation($ids: [ID!]!) {
      verifyTriviaCategories(ids: $ids) {
        count
      }
    }
  `

  const [verifyTriviaCategories] = useMutation<Mutation>({
    query: verifyTriviaCategoriesMutation,
  })

  const removeTriviaCategoriesMutation = graphql`
    mutation Mutation($ids: [ID!]!) {
      removeTriviaCategories(ids: $ids) {
        count
      }
    }
  `

  const [removeTriviaCategories] = useMutation<Mutation>({
    query: removeTriviaCategoriesMutation,
  })

  const mergeTriviaCategoriesIntoMutation = graphql`
    mutation Mutation($ids: [ID!]!, $targetId: ID!) {
      mergeTriviaCategoriesInto(ids: $ids, targetId: $targetId) {
        count
      }
    }
  `

  const [mergeTriviaCategoriesInto] = useMutation<Mutation>({
    query: mergeTriviaCategoriesIntoMutation,
  })

  const handleVerifyClick = React.useMemo(() => {
    return async () => {
      const prompt = showPromptDialog({
        title: 'Verify selected categories?',
        buttons: [{ key: 'y', label: 'YES' }, { key: 'n', label: 'NO' }],
      })

      if (await prompt !== 'y') {
        return
      }

      await verifyTriviaCategories({ ids: getSelectedIds() })

      reload()
      setSelectedIndexes([])
      dispatchReloadTriviaCounts()
    }
  }, [getSelectedIds, reload, verifyTriviaCategories, setSelectedIndexes, showPromptDialog])

  const handleDeleteClick = React.useMemo(() => {
    return async () => {
      const prompt = showPromptDialog({
        title: 'Delete selected categories?',
        buttons: [{ key: 'y', label: 'YES' }, { key: 'n', label: 'NO' }],
      })

      if (await prompt !== 'y') {
        return
      }

      await removeTriviaCategories({ ids: getSelectedIds() })

      reload()
      setSelectedIndexes([])
      dispatchReloadTriviaCounts()
    }
  }, [getSelectedIds, reload, removeTriviaCategories, setSelectedIndexes, showPromptDialog])

  const [mergeDialogOpen, setMergeDialogOpen] = React.useState(false)

  const handleMergeDialogOpen = () =>
    setMergeDialogOpen(true)

  const handleMergeDialogClose = () =>
    setMergeDialogOpen(false)

  const triviaCategoriesQuery = React.useMemo(() => {
    return mergeDialogOpen ? graphql`
      query Query {
        triviaCategories(verified: true, disabled: false) {
          id
          name
        }
      }
    ` : undefined
  }, [mergeDialogOpen])

  const [triviaCategoriesResult] = useQuery<Query>({
    query: triviaCategoriesQuery,
  })

  const initialMergeValues = React.useMemo(() => {
    return {
      target: null as { id: string } | null,
    }
  }, [])

  const handleMergeSubmit = React.useMemo(() => {
    return async (values: typeof initialMergeValues) => {
      await mergeTriviaCategoriesInto({ ids: getSelectedIds(), targetId: values.target?.id })

      reload()
      setSelectedIndexes([])
      dispatchReloadTriviaCounts()
    }
  }, [getSelectedIds, reload, mergeTriviaCategoriesInto, setSelectedIndexes, initialMergeValues])

  return (
    <div className="MuiToolbar-gutters" style={{ flex: '1 1 auto', textAlign: 'right' }}>
      {isTriviaAdmin && (
        <IconButton onClick={handleMergeDialogOpen}>
          <CallMerge />
        </IconButton>
      )}
      {isTriviaAdmin && (
        <IconButton onClick={handleVerifyClick} title={'Verify selection'}>
          <Check />
        </IconButton>
      )}
      {isTriviaAdmin && (
        <IconButton onClick={handleDeleteClick}>
          <Delete />
        </IconButton>
      )}

      <Dialog open={mergeDialogOpen} onClose={handleMergeDialogClose} maxWidth="xl">
        <Form initialValues={initialMergeValues} onSubmit={handleMergeSubmit}>
          <DialogTitle>Merge selected categories into another</DialogTitle>
          <DialogContent>
            <div>
              <FormAutocomplete name="target" options={triviaCategoriesResult?.triviaCategories?.filter(c => !getSelectedIds().includes(c.id)) ?? []} getOptionLabel={o => typeof o === 'string' ? o : o.name} autoHighlight filterSelectedOptions
                renderOption={option => (
                  <React.Fragment>
                    <VerifiedUser style={{ marginRight: '8px' }} />
                    <span>{option.name}</span>
                  </React.Fragment>
                )}
                renderInput={params => (
                  <TextField {...params} label="Target Category" style={{ width: '100%' }} required />
                )} />
            </div>
          </DialogContent>
          <DialogActions>
            <Form.Context.Consumer>
              {({ formState, submit, reset }) => (
                <React.Fragment>
                  <Button
                    type="button"
                    onClick={() => { reset(); handleMergeDialogClose(); }}
                  >
                    Cancel
                    </Button>

                  <ProgressButton
                    type="button"
                    onClick={submit}
                    disabled={!formState.isSubmittable}
                    loading={formState.isSubmitting}
                  >
                    Submit
                    </ProgressButton>
                </React.Fragment>
              )}
            </Form.Context.Consumer>
          </DialogActions>
        </Form>
      </Dialog>
    </div>
  )
}
