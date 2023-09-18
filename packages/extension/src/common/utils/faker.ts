import { faker as fakerEN } from '@faker-js/faker/locale/en'
import { faker as fakerZH_CN } from '@faker-js/faker/locale/zh_CN'
import { faker as fakerJA } from '@faker-js/faker/locale/ja'

class FakerHandler {}

class FakerWrapper {
  private fakers = {
    en: fakerEN,
    cn: fakerZH_CN,
    ja: fakerJA,
  }

  get cn() {
    return this.fakers.cn
  }
  get ja() {
    return this.fakers.ja
  }
}
const faker = new FakerWrapper()
console.log(faker.ja.person.fullName())
