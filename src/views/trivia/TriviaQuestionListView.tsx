import React, { useState } from 'react'
import { graphql } from '../../lib/graphql/graphql'
import useRelayConnectionQuery from '../../lib/graphql/useRelayConnectionQuery'
import { relayConnectionFragment } from '../../lib/graphql/useRelayConnection'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import useDrawerWithoutPadding from '../../lib/useDrawerWithoutPadding'
import useAuthorization from '../../lib/useAuthorization'
import AppTable from '../../app/AppTable'
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@material-ui/core'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import CloudUpload from '@material-ui/icons/CloudUpload'
import { MUIDataTableOptions } from 'mui-datatables'
import debounce from '../../lib/debounce'
import UploadIconButton from '../../lib/mui/UploadIconButton'
import readFile from '../../lib/readFile'
import useMutation from '../../lib/graphql/useMutation'
import NavLink from '../../lib/mui/NavLink'
import { TriviaQuestion, Mutation, TriviaCategory, Query } from '../../lib/graphql/schema.gql'
import { useSnackbar } from 'notistack'
import Check from '@material-ui/icons/VerifiedUser'
import Delete from '@material-ui/icons/Delete'
import VerifiedUser from '@material-ui/icons/VerifiedUserOutlined'
import { useQueryParams } from '../../lib/hookrouter'
import Category from '@material-ui/icons/Category'
import Form from '../../lib/Form'
import ProgressButton from '../../lib/mui/ProgressButton'
import useQuery from '../../lib/graphql/useQuery'
import { dispatchReloadTriviaCounts } from '../../app/AppSidebar'
import FormAutocomplete from '../../lib/mui/FormAutocomplete'
import useShowPromptDialog from '../../lib/useShowPromptDialog'

const TriviaQuestionListView: React.FC = () => {
  useDocumentAndDrawerTitle('Trivia Questions')
  useDrawerWithoutPadding()

  const query = graphql`
    query Query($after: String, $before: String, $first: Int, $last: Int, $search: String, $sortField: String, $sortDirection: SortDirection, $verified: Boolean, $disabled: Boolean, $reported: Boolean, $dangling: Boolean) {
      triviaQuestions(after: $after, before: $before, first: $first, last: $last, search: $search, sortField: $sortField, sortDirection: $sortDirection, verified: $verified, disabled: $disabled, reported: $reported, dangling: $dangling) {
        ${relayConnectionFragment(graphql`
          fragment Fragment on TriviaQuestion {
            id
            category {
              name
              verified
              disabled
            }
            question
            hint1
            hint2
            submitter
            updatedAt
            answer
            verified
          }
        `)}
      }
    }
  `

  const [{ verified, disabled, reported, dangling }] = useQueryParams()
  const [isTriviaAdmin] = useAuthorization('trivia-admin')

  const [variables, setVariables] = useState({
    search: undefined as string | undefined,
    sortField: 'updatedAt' as string | undefined,
    sortDirection: 'DESC',
    verified: undefined as boolean | undefined,
    disabled: false as boolean | undefined,
    reported: undefined as boolean | undefined,
    dangling: undefined as boolean | undefined,
  })

  React.useEffect(() => {
    setVariables(variables => ({
      ...variables,
      verified,
      disabled,
      reported,
      dangling,
    }))
  }, [setVariables, verified, disabled, reported, dangling])

  const [[data, error, loading, retry], [count, page, paginateForwards, paginateBackwards]] = useRelayConnectionQuery<TriviaQuestion>({
    query,
    variables,
    pageSize: 20,
  })

  const changePage = React.useMemo(() => {
    return (newPage: number) => {
      if (paginateForwards && newPage >= page) {
        paginateForwards!()
      } else if (paginateBackwards) {
        paginateBackwards!()
      }
    }
  }, [page, paginateBackwards, paginateForwards])

  const changeSort = React.useMemo(() => {
    return (field: string, direction: string) =>
      setVariables(state => ({
        ...state,
        sortField: field,
        sortDirection: direction.toUpperCase(),
      }))
  }, [])

  const changeSearch = React.useMemo(() => {
    return debounce((search: string) =>
      setVariables(state => ({
        ...state,
        search,
      }))
      , 500)
  }, [])

  const [selectedIndexes, setSelectedIndexes] = React.useState<number[]>([])

  const tableOptions = React.useMemo<MUIDataTableOptions>(() => {
    return {
      serverSide: true,
      count,
      filter: false,
      rowsPerPageOptions: [20],
      rowsPerPage: 20,
      responsive: 'scrollMaxHeight',
      onTableChange: (action, tableState) => {
        const activeColumn = (tableState.activeColumn !== null) ? (tableState as any).columns[tableState.activeColumn] : null

        switch (action) {
          case 'changePage':
            changePage(tableState.page + 1)
            setSelectedIndexes([])
            break
          case 'sort':
            changeSort(activeColumn!.name, activeColumn!.sortDirection)
            setSelectedIndexes([])
            break
        }
      },
      onSearchChange: changeSearch,
      searchText: variables.search,
      customToolbar: () => <CustomToolbar reload={retry} />,
      selectableRows: isTriviaAdmin ? 'multiple' : 'none',
      isRowSelectable: () => isTriviaAdmin,
      onRowsSelect: (clickedRows, selectedRows) => {
        setSelectedIndexes(selectedRows.slice(0, 20).map(r => r.dataIndex))
      },
      rowsSelected: selectedIndexes,
      customToolbarSelect: () => <CustomSelectedItemsToolbar reload={retry} selectedQuestions={selectedIndexes.map(i => data![i])} setSelectedIndexes={setSelectedIndexes} />,
    }
  }, [count, variables.search, changePage, changeSearch, changeSort, retry, isTriviaAdmin, data, selectedIndexes, setSelectedIndexes])

  if (data) {
    return (
      <div>
        <AppTable title="" className="fullscreen" data={data} options={tableOptions} customOptions={variables}>
          <AppTable.Column name="id" options={{ display: 'excluded' }} />
          <AppTable.Column name="" options={{ empty: true, filter: false, sort: false }}>
            {(_, meta) => (
              <NavLink href={`/trivia/questions/${meta.rowData?.[0]}`}>
                <IconButton size="small">
                  <OpenInBrowser />
                </IconButton>
              </NavLink>
            )}
          </AppTable.Column>
          <AppTable.Column name="category.name" label="Category" />
          <AppTable.Column name="question" label="Question" />
          <AppTable.Column name="hint1" label="Hint 1" />
          <AppTable.Column name="hint2" label="Hint 2" />
          <AppTable.Column name="submitter" label="Submitter" />
          <AppTable.Column name="updatedAt" label="Updated">
            {v => new Date(v).toLocaleDateString()}
          </AppTable.Column>
          <AppTable.Column name="answer" label="Answer" options={{ display: isTriviaAdmin ? undefined : 'false' }} />
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

export default TriviaQuestionListView

const CustomToolbar: React.FC<{ reload: () => void }> = props => {
  const { reload } = props
  const { enqueueSnackbar } = useSnackbar()
  const [isAdmin] = useAuthorization('admin')

  const [importLegacyTriviaQuestions] = useMutation({
    query: graphql`
      mutation Mutation($input: [TriviaQuestionLegacyInput!]!) {
        importLegacyTriviaQuestions(input: $input) {
          count
        }
      }
    `,
  })

  const handleImportLegacyQuestions = React.useMemo(() => {
    return async ([file]: any[]) => {
      try {
        const json = await readFile(file)
        const data = JSON.parse(json) as any[]

        for (let i = 0; i < data.length; i += 10) {
          await importLegacyTriviaQuestions({ input: data.slice(i, i + 10) })
        }

        reload()
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [reload, enqueueSnackbar, importLegacyTriviaQuestions])

  return (
    <React.Fragment>
      {isAdmin && (
        <UploadIconButton onUpload={handleImportLegacyQuestions} title="Import legacy questions (JSON)">
          <CloudUpload />
        </UploadIconButton>
      )}
    </React.Fragment>
  )
}

const CustomSelectedItemsToolbar: React.FC<{ reload: () => void, selectedQuestions: TriviaQuestion[], setSelectedIndexes: React.Dispatch<React.SetStateAction<number[]>> }> = props => {
  const { reload, selectedQuestions, setSelectedIndexes } = props
  const [isTriviaAdmin] = useAuthorization('trivia-admin')
  const showPromptDialog = useShowPromptDialog()

  const verifyTriviaQuestionsMutation = graphql`
    mutation Mutation($ids: [ID!]!) {
      verifyTriviaQuestions(ids: $ids) {
        count
      }
    }
  `

  const [verifyTriviaQuestions] = useMutation<Mutation>({
    query: verifyTriviaQuestionsMutation,
  })

  const removeTriviaQuestionsMutation = graphql`
    mutation Mutation($ids: [ID!]!) {
      removeTriviaQuestions(ids: $ids) {
        count
      }
    }
  `

  const [removeTriviaQuestions] = useMutation<Mutation>({
    query: removeTriviaQuestionsMutation,
  })

  const getSelectedIds = React.useMemo(() => {
    return () =>
      selectedQuestions.map(q => q.id)
  }, [selectedQuestions])

  const canVerifySelection = React.useMemo(() => {
    return !selectedQuestions
      .some(question => !question.category?.verified || question.category?.disabled)
  }, [selectedQuestions])

  const handleVerifyClick = React.useMemo(() => {
    return async () => {
      const prompt = showPromptDialog({
        title: 'Verify selected questions?',
        buttons: [{ key: 'y', label: 'YES' }, { key: 'n', label: 'NO' }],
      })

      if (await prompt !== 'y') {
        return
      }

      await verifyTriviaQuestions({ ids: getSelectedIds() })

      reload()
      setSelectedIndexes([])
      dispatchReloadTriviaCounts()
    }
  }, [getSelectedIds, reload, verifyTriviaQuestions, setSelectedIndexes, showPromptDialog])

  const handleDeleteClick = React.useMemo(() => {
    return async () => {
      const prompt = showPromptDialog({
        title: 'Delete selected questions?',
        buttons: [{ key: 'y', label: 'YES' }, { key: 'n', label: 'NO' }],
      })

      if (await prompt !== 'y') {
        return
      }

      await removeTriviaQuestions({ ids: getSelectedIds() })

      reload()
      setSelectedIndexes([])
      dispatchReloadTriviaCounts()
    }
  }, [getSelectedIds, reload, removeTriviaQuestions, setSelectedIndexes, showPromptDialog])

  const [changeCategoryDialogOpen, setChangeCategoryDialogOpen] = React.useState(false)

  const triviaCategoriesQuery = React.useMemo(() => {
    return changeCategoryDialogOpen ? graphql`
      query Query {
        triviaCategories(verified: true, disabled: false) {
          id
          name
        }
      }
    ` : undefined
  }, [changeCategoryDialogOpen])

  const [triviaCategoriesResult] = useQuery<Query>({
    query: triviaCategoriesQuery,
  })

  const handleChangeCategoryDialogOpen = () =>
    setChangeCategoryDialogOpen(true)

  const handleChangeCategoryDialogClose = () =>
    setChangeCategoryDialogOpen(false)

  const initialChangeCategoryValues = React.useMemo(() => {
    return {
      category: null as TriviaCategory | null,
    }
  }, [])

  const categorizeTriviaQuestionsMutation = graphql`
    mutation Mutation($ids: [ID!]!, $categoryId: ID!) {
      categorizeTriviaQuestions(ids: $ids, categoryId: $categoryId) {
        count
      }
    }
  `

  const [categorizeTriviaQuestions] = useMutation<Mutation>({
    query: categorizeTriviaQuestionsMutation,
  })

  const handleReportSubmit = React.useMemo(() => {
    return async (values: typeof initialChangeCategoryValues) => {
      await categorizeTriviaQuestions({ ids: getSelectedIds(), categoryId: values.category?.id })

      setChangeCategoryDialogOpen(false)

      reload()
      setSelectedIndexes([])
      dispatchReloadTriviaCounts()
    }
  }, [initialChangeCategoryValues, categorizeTriviaQuestions, setChangeCategoryDialogOpen, getSelectedIds, reload, setSelectedIndexes])

  return (
    <div className="MuiToolbar-gutters" style={{ flex: '1 1 auto', textAlign: 'right' }}>
      {isTriviaAdmin && (
        <IconButton onClick={handleChangeCategoryDialogOpen}>
          <Category />
        </IconButton>
      )}
      {isTriviaAdmin && (
        <IconButton onClick={handleVerifyClick} title={canVerifySelection ? 'Verify selection' : 'Some selected questions are assigned to either unverified or disabled categories'} disabled={!canVerifySelection}>
          <Check />
        </IconButton>
      )}
      {isTriviaAdmin && (
        <IconButton onClick={handleDeleteClick}>
          <Delete />
        </IconButton>
      )}
      {isTriviaAdmin && (
        <Dialog open={changeCategoryDialogOpen} onClose={handleChangeCategoryDialogClose} maxWidth="xl">
          <Form initialValues={initialChangeCategoryValues} onSubmit={handleReportSubmit}>
            <DialogTitle>Change category of selected questions</DialogTitle>
            <DialogContent>
              <div>
                <FormAutocomplete name="category" options={triviaCategoriesResult?.triviaCategories ?? []} getOptionLabel={o => typeof o === 'string' ? o : o.name} autoHighlight filterSelectedOptions
                  renderOption={option => (
                    <React.Fragment>
                      <VerifiedUser style={{ marginRight: '8px' }} />
                      <span>{option.name}</span>
                    </React.Fragment>
                  )}
                  renderInput={params => (
                    <TextField {...params} label="Category" style={{ width: '100%' }} required />
                  )} />
              </div>
            </DialogContent>
            <DialogActions>
              <Form.Context.Consumer>
                {({ formState, submit, reset }) => (
                  <React.Fragment>
                    <Button
                      type="button"
                      onClick={() => { reset(); handleChangeCategoryDialogClose(); }}
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
      )}
    </div>
  )
}
