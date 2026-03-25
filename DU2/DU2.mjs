import fs from 'fs'

fs.readFile('instrukce.txt', (err, data) => {
  if (err) {
    console.error('Soubor instrukce.txt neexistuje.')
    return
  }

  let source = data.toString().split('\n')[0].trim()
  let destination = data.toString().split('\n')[1].trim()

  fs.readFile(source, (err, data) => {
    if (err) {
      console.error(`Zdrojový soubor "${source}" neexistuje.`)
      return
    }

    fs.writeFile(destination, data.toString(), (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log(`Obsah souboru "${source}" byl zkopírován do "${destination}".`)
      }
    })
  })
})