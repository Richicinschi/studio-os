# Actions and Forms

## Actions

An Action is a server function with typed input, built-in validation and a typed result. For most form submissions and data changes it saves you from writing an API route.

### Defining one

```ts
// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  signup: defineAction({
    accept: 'form',               // 'form' reads FormData; leave it out for JSON
    input: z.object({
      email: z.email(),  // Zod 4 puts validators at the top level
    }),
    handler: async (input, context) => {
      // context offers: locals, cookies, request
      if (!context.locals.user) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
      }
      await db.subscribers.insert({ email: input.email })
      return { success: true }
    },
  }),
}
```

### From an HTML form

```astro
---
import { actions, isInputError } from 'astro:actions'
const result = Astro.getActionResult(actions.signup)
const inputErrors = isInputError(result?.error) ? result.error.fields : {}
---
<form method="POST" action={actions.signup}>
  <input name="email" type="email" />
  {inputErrors.email && <p>{inputErrors.email.join(', ')}</p>}
  <button>Join</button>
</form>
```

### From browser JavaScript

```ts
import { actions } from 'astro:actions'

// default style: you get { data, error } back and decide what to do
const { data, error } = await actions.signup({ email: 'ana@example.org' })
if (error) {
  console.log(error.code, error.message)
}

// alternative: let it throw
const data = await actions.signup.orThrow({ email: 'ana@example.org' })
```

### From server code

```ts
// inside an .astro page or middleware
const { data, error } = await Astro.callAction(actions.signup, { email })

// inside an API endpoint
export const POST: APIRoute = async (context) => {
  const { data, error } = await context.callAction(actions.signup, { email })
}
```

### Splitting actions across files

```ts
// src/actions/user.ts
export const user = {
  getProfile: defineAction({ /* ... */ }),
  updateProfile: defineAction({ /* ... */ }),
}

// src/actions/index.ts
import { user } from './user'
export const server = { user }
// called as actions.user.getProfile()
```

### Typing form inputs

FormData arrives as strings, so some fields need coercion:

```ts
input: z.object({
  name: z.string(),                    // plain text field
  age: z.number(),                     // number field (an empty one arrives as null)
  agreed: z.coerce.boolean(),          // checkbox, on/off becomes true/false
  files: z.array(z.instanceof(File)),  // multi-file upload
})
```

A blank field turns into `null`. Two exceptions: booleans become `false` and arrays become `[]`.

### What a result can contain

The return value can hold Date, Map, Set, URL, BigInt and Uint8Array. In transit it is encoded with devalue, not plain JSON, so read `data` in your code rather than judging the raw network response.

## Actions or API routes?

| | Actions | API routes |
|---|---|---|
| Good for | forms, data changes, RPC-style calls | webhooks, third-party callbacks, streamed responses |
| Validation | Zod, built in | you write it |
| CSRF | handled | you handle it |
| Types | input and output, end to end | you maintain them |
| Folder | `src/actions/` | `src/pages/api/` |

Start with Actions. Drop to an API route when you need full control of Request and Response.

Security: an Action is a public endpoint. Check authorization inside the handler, and keep login state in server sessions or HttpOnly cookies, not in browser storage.

## Forms without Actions

For a very simple form you can read the POST yourself:

```astro
---
// src/pages/contact.astro
export const prerender = false  // POST handling needs on-demand rendering

let message = ''
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData()
  const name = formData.get('name')
  // do something with it...
  message = 'Received!'
}
---
<form method="POST">
  <input name="name" required />
  <button>Send</button>
</form>
{message && <p>{message}</p>}
```

## Pitfalls, grouped

Setup
- Form submissions need `accept: 'form'`; the default is JSON.
- Actions on a prerendered page do not work: form posts need on-demand rendering (`export const prerender = false` or `output: 'server'`).
- Imports: Actions from `astro:actions`, Zod from `astro/zod` (not `zod`).

Handling results
- An Action returns `{ data, error }`, not the data itself; always check `error`.
- Treating Actions as private is wrong: they are public at `/_actions/[name]`, so authorize in the handler.

Zod 4 spellings
- `z.email()` and `z.url()` replace `z.string().email()` and `z.string().url()`.
- Error text uses `{ error: "..." }`, not `{ message: "..." }`.
- Do not write `z.coerce.number()` for an optional number field: an empty field becomes 0 silently.

Hand-built routes
- A manual POST route for a form gives up validation, CSRF handling and types; use an Action unless you need raw Request/Response.
