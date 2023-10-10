import { allFakers } from '@faker-js/faker'
import * as R from 'ramda'

type FakerLocales = keyof typeof allFakers
const fakerLocales = R.keys(allFakers) as FakerLocales[]
