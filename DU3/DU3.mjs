import fs from 'fs/promises'

const data = await fs.readFile('instrukce.txt', 'utf8')
const n = parseInt(data)
const promises = []
for (let i = 0; i < n; i++) {
    promises.push(fs.writeFile(`${i}.txt`, `Soubor ${i}`))
  }
await Promise.all(promises)
console.log("Všechny soubory byly vytvořeny")