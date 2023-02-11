const { faker } = require('@faker-js/faker')
const fs = require('fs/promises')
const nameAndEmails = []
faker.setLocale('zh_CN')
for (let i = 0; i < 5000; i++) {
  let name
  while ((name = faker.name.fullName())) {
    let repeat = false
    nameAndEmails.forEach((item) => {
      if (item.name === name) repeat = true
      return
    })
    if (!repeat) break
  }
  const email = faker.internet.email()
  nameAndEmails.push({ name, email })
}
nameAndEmails.forEach((item) => {
  fs.appendFile('test/folder2/test.csv', `${item.name},${item.email}\n`)
})
