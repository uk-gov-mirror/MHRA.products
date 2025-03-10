import { useState, useRef } from 'react'
import { FormGroup } from './form'
import { ScreenReaderOnly } from './screen_reader_only'
import { Layout } from './layout'
import { Para, H1 } from './typography'
import { BackLink } from './back-link'
import { Field } from './field'
import { Button, ButtonWithLinkStyles } from './button'
import { useIncrementingIds } from './useIncrementingIds'

export const Products = ({
  currentStepData,
  currentStepIndex,
  steps,
  submit,
  repeatPage,
  savePageState,
  goBack,
  goToPage: go,
  deletePage: delPage,
}) => {
  const formRef = useRef()
  const getNextId = useIncrementingIds()

  const [activeSubstanceIds, setSubstanceIds] = useState(() =>
    currentStepData
      ? currentStepData.getAll('active_substance').map(() => getNextId())
      : [getNextId()]
  )
  const [formIsValid, setFormIsValid] = useState(true)

  const getFormData = () => {
    const formData = new FormData(formRef.current)
    formData.append('title', product_title(formData))
    formData.append('licence_number', licence_number(formData))

    return formData
  }

  const checkLicenceNumberIsNotDuplicate = () => {
    const formData = getFormData()

    const licence_number_is_duplicate = steps
      .map(({ data }) => data && data.get('licence_number'))
      .filter((x) => x)
      .some((licence) => licence === formData.get('licence_number'))

    Array.from(
      formRef.current.querySelectorAll(
        '[name="licence_number_type"], [name="licence_part_one"], [name="licence_part_two"]'
      )
    ).map((el) => {
      el.setCustomValidity(
        licence_number_is_duplicate
          ? 'Duplicate licence numbers are not allowed'
          : ''
      )
    })
  }

  const onSubmit = (event) => {
    event.preventDefault()

    setFormIsValid(true)

    const formData = getFormData()

    submit(formData)
  }

  const onInvalid = () => {
    setFormIsValid(false)
  }

  const onAddAnotherProduct = (event) => {
    event.preventDefault()

    const isValid = formRef.current.reportValidity()
    setFormIsValid(isValid)

    if (isValid) {
      repeatPage(getFormData())
    }
  }

  const onAddAnotherSubstance = (event) => {
    event.preventDefault()
    setSubstanceIds((ids) => [...ids, getNextId()])
  }

  const goToPage = (newPageIndex) => {
    savePageState(getFormData())

    go(newPageIndex)
  }

  const deletePage = (pageIndex) => {
    savePageState(getFormData())

    delPage(pageIndex)
  }

  const title = 'New Public Assessment Report'

  return (
    <Layout
      title={formIsValid ? title : `Error: ${title}`}
      intro={<BackLink href="/" onClick={goBack} />}
    >
      <H1>{title}</H1>

      <Para>
        Your report can have one or multiple products associated with it. Please
        add one product at a time.
      </Para>

      <PreviousProductsSummary
        products={steps.filter(({ type, data }) => type === 'product' && data)}
        currentStepIndex={currentStepIndex}
        goToPage={goToPage}
        deletePage={deletePage}
      />

      <form onSubmit={onSubmit} onInvalid={onInvalid} ref={formRef}>
        <FormGroup>
          <Field
            name="product_name"
            label="Brand/Generic name"
            formData={currentStepData}
            helpContents={
              <span>
                To add multiple names, separate them with a forward slash (/)
              </span>
            }
          />
        </FormGroup>
        <FormGroup>
          <Field name="strength" label="Strength" formData={currentStepData} />
        </FormGroup>
        <FormGroup>
          <Field
            name="pharmaceutical_dose"
            label="Pharmaceutical dose form"
            formData={currentStepData}
          />
        </FormGroup>
        {activeSubstanceIds.map((id, i) => (
          <FormGroup key={id}>
            <Field
              name="active_substance"
              label="Active substance(s)"
              index={i}
              formData={currentStepData}
              onClickDelete={
                activeSubstanceIds.length > 1
                  ? () => {
                      setSubstanceIds((ids) => ids.filter((i) => i != id))
                    }
                  : null
              }
            />
          </FormGroup>
        ))}
        <Button secondary type="button" onClick={onAddAnotherSubstance}>
          Add another active substance
        </Button>
        <LicenceNumber
          formData={currentStepData}
          checkLicenceNumberIsNotDuplicate={checkLicenceNumberIsNotDuplicate}
        />
        <Button secondary type="button" onClick={onAddAnotherProduct}>
          Add another product
        </Button>{' '}
        <Button type="submit">Continue</Button>
      </form>
    </Layout>
  )
}

const PreviousProductsSummary = ({
  products,
  currentStepIndex,
  goToPage,
  deletePage,
}) => {
  if (!products.length) {
    return null
  }

  return (
    <dl className="govuk-summary-list">
      {products.map(({ data, index }) => {
        const showRemoveButton =
          index === currentStepIndex && products.length > 1

        return (
          <div key={index} className="govuk-summary-list__row">
            <dt
              className="govuk-summary-list__key"
              style={{
                fontWeight: index === currentStepIndex ? 'bold' : 'normal',
              }}
            >
              {product_title(data)}
            </dt>
            <dd className="govuk-summary-list__actions">
              <ButtonWithLinkStyles
                type="button"
                style={
                  showRemoveButton
                    ? {
                        // Couldn't find anything in the design system for updating
                        // the link colour, so just nabbed this from:
                        // https://design-system.service.gov.uk/styles/colour/
                        color: '#d4351c',
                      }
                    : {}
                }
                onClick={(event) => {
                  event.preventDefault()

                  if (showRemoveButton) {
                    deletePage(index)
                  } else {
                    goToPage(index)
                  }
                }}
              >
                {showRemoveButton ? 'Remove' : 'Edit'}
                <span className="govuk-visually-hidden"> product</span>
              </ButtonWithLinkStyles>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

const LicenceNumber = ({ formData, checkLicenceNumberIsNotDuplicate }) => (
  <FormGroup>
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
        <h2 className="govuk-fieldset__heading">Licence number</h2>
      </legend>
      <ScreenReaderOnly>
        <label htmlFor="licence_number_type">Type</label>
      </ScreenReaderOnly>
      <select
        className="govuk-select"
        id="licence_number_type"
        name="licence_number_type"
        defaultValue={
          (formData && formData.get('licence_number_type')) || undefined
        }
        required
        onInput={checkLicenceNumberIsNotDuplicate}
      >
        <option value="PL">PL</option>
        <option value="PLPI">HR</option>
        <option value="THR">THR</option>
      </select>{' '}
      <Field
        className="govuk-input--width-5"
        name="licence_part_one"
        label="First five digits"
        pattern="[0-9]{5}"
        title="5 digits"
        visuallyHideLabel
        formData={formData}
        onInput={checkLicenceNumberIsNotDuplicate}
      />
      {' / '}
      <Field
        className="govuk-input--width-5"
        name="licence_part_two"
        label="Last four digits"
        pattern="[0-9]{4}"
        title="4 digits"
        visuallyHideLabel
        formData={formData}
        onInput={checkLicenceNumberIsNotDuplicate}
      />
    </fieldset>
  </FormGroup>
)

const product_title = (formData) =>
  [
    formData.get('product_name'),
    formData.get('strength'),
    formData.get('pharmaceutical_dose'),
  ]
    .filter((x) => x)
    .join(' ')
    .toUpperCase()
    .concat(' - ')
    .concat(licence_number(formData))

const licence_number = (formData) => {
  const licence_type = formData.get('licence_number_type')
  const part_one = formData.get('licence_part_one')
  const part_two = formData.get('licence_part_two')

  return `${licence_type} ${part_one}/${part_two}`
}
