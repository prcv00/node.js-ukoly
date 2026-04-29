import test from 'ava'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { eq } from 'drizzle-orm'
import { app, db } from '../src/app.js'
import { todosTable } from '../src/schema.js'

test.before('migrate database', async () => {
  await migrate(db, { migrationsFolder: './drizzle' })
})

test.beforeEach(async () => {
  await db.delete(todosTable)
})

test.serial('it shows proper title', async (t) => {
  const response = await app.request('/')
  const html = await response.text()

  t.assert(html.includes('<title>Todo seznam</title>'))
})

test.serial('it shows todos', async (t) => {
  await db.insert(todosTable).values({
    title: 'Moje todočko',
    priority: 'medium',
    done: false,
  })

  const response = await app.request('/')
  const html = await response.text()

  t.assert(html.includes('Moje todočko'))
})

test.serial('it allows creating todos', async (t) => {
  const formData = new FormData()
  formData.set('title', 'Testovací todočko')
  formData.set('priority', 'medium')

  const response = await app.request('/add-todo', {
    method: 'POST',
    body: formData,
  })

  // Ověřím že proběhl redirect
  t.is(response.status, 302)

  // Získám si lokaci kam mě redirect posílá
  const location = response.headers.get('location')

  // Udělám druhý request
  const response2 = await app.request(location, {
    method: 'GET',
  })

  const text = await response2.text()

  // Ověřím že todočko z formuláře se nachází v HTML
  t.assert(text.includes('Testovací todočko'))
})

test.serial('it shows todo detail', async (t) => {
  const insertResult = await db.insert(todosTable).values({
    title: 'Detail todočko',
    priority: 'high',
    done: false,
  })

  const id = Number(insertResult.lastInsertRowid)
  const response = await app.request(`/todo/${id}`)
  const html = await response.text()

  t.is(response.status, 200)
  t.assert(html.includes('Detail todočko'))
  t.assert(html.includes('Vysoká'))
})

test.serial('it updates todo title and priority', async (t) => {
  const insertResult = await db.insert(todosTable).values({
    title: 'Puvodni nazev',
    priority: 'low',
    done: false,
  })

  const id = Number(insertResult.lastInsertRowid)
  const formData = new FormData()
  formData.set('title', 'Novy nazev')
  formData.set('priority', 'high')

  const response = await app.request(`/update-todo/${id}`, {
    method: 'POST',
    body: formData,
    headers: {
      referer: `/todo/${id}`,
    },
  })

  t.is(response.status, 302)
  t.is(response.headers.get('location'), `/todo/${id}`)

  const updatedTodo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()
  t.is(updatedTodo.title, 'Novy nazev')
  t.is(updatedTodo.priority, 'high')
})

test.serial('it toggles todo done state', async (t) => {
  const insertResult = await db.insert(todosTable).values({
    title: 'Toggle todo',
    priority: 'medium',
    done: false,
  })

  const id = Number(insertResult.lastInsertRowid)
  const response = await app.request(`/toggle-todo/${id}`)
  t.is(response.status, 302)

  const toggledTodo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()
  t.true(toggledTodo.done)
})

test.serial('it removes todo', async (t) => {
  const insertResult = await db.insert(todosTable).values({
    title: 'Smazat todo',
    priority: 'medium',
    done: false,
  })

  const id = Number(insertResult.lastInsertRowid)
  const response = await app.request(`/remove-todo/${id}`)
  t.is(response.status, 302)
  t.is(response.headers.get('location'), '/')

  const removedTodo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()
  t.is(removedTodo, undefined)
})

test.serial('it returns 404 for unknown route', async (t) => {
  const response = await app.request('/neexistuje')
  const html = await response.text()

  t.is(response.status, 404)
  t.assert(html.includes('Stránka nenalezena'))
})
