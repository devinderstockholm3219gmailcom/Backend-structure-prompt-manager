# AI Prompt Manager — Project Progress

## Tech Stack
- Runtime: Bun
- Language: TypeScript (strict)
- Framework: Fastify (functional style, no classes)
- Database: MongoDB Atlas (cloud) + Mongoose
- Auth: Custom JWT (access + refresh tokens)
- Validation: Zod
- Architecture: Repository Pattern (repo → service → controller)
- Types: Centralized /types folder
- Error Handling: Fastify plugins (not Express middleware)

## Decisions Made
- Functions over classes (Fastify is functional, no `this` issues)
- MongoDB over PostgreSQL (prompts are document-shaped)
- Repository pattern (database is swappable)
- Path aliases (@config/, @types/, etc.)
- Zod over JSON Schema (gives TypeScript types for free)
- verbatimModuleSyntax: true (must use `import type` for types)
- safeParse over parse (we control error handling)
- process.exit(1) for startup failures, throw for runtime errors
- MongoDB Atlas (cloud) instead of local MongoDB
- Database name: ai-prompt-manager
- async pre('save') without next() (Mongoose handles async automatically)
- schema.set('toJSON') over methods.toJSON (cleaner TypeScript types)
- .min(1) over required_error in Zod (avoids version compatibility issues)
- Two JWT secrets (access + refresh can't be interchanged)
- Ambiguous login errors "Invalid email or password" (security best practice)
- validate() helper to avoid repeating Zod safeParse in every controller
- addHook for route groups where ALL routes need auth
- Unlink prompts before deleting collection (prevent orphaned references)

---

## Key Concepts Learned

### Session 1 (Setup + Types)
- **package.json**: dependencies, devDependencies, scripts
- **tsconfig.json**: strict mode, path aliases, noEmit (Bun runs TS directly)
- **.env file**: secrets stored separately, never pushed to GitHub
- **dotenv**: reads .env file into process.env
- **Zod safeParse vs parse**: safeParse returns result object, parse throws error
- **process.exit(1) vs throw**: exit for startup failures, throw for runtime errors
- **console.error vs console.log**: error goes to stderr (for monitoring tools)
- **.flatten().fieldErrors**: Zod helper to get clean error messages per field
- **Mongoose event listeners**: .on('connected'), set up BEFORE connecting
- **await**: "don't go to next line until this finishes"
- **Fastify logger**: true = logs all requests, false = silent
- **Health check route**: simple endpoint to test if server is alive
- **Fastify return vs Express res.send()**: Fastify auto-sends returned data
- **Number(env.PORT)**: convert string to number (env vars are always strings)
- **interface extends Document**: adds Mongoose methods (save, delete) to our type
- **Generics <T>**: placeholder type — one interface works for many data types
- **Optional fields (?)**: field can be undefined (not required)
- **string | null**: field can be string OR null (remove value explicitly)
- **import type**: required by verbatimModuleSyntax for type-only imports

### Session 2 (Models + Schemas + Plugins + Auth) — 8 mars 2026

#### Models (Mongoose)
- **Schema<IUser>**: generic tells Mongoose what fields to expect
- **required: [true, 'message']**: array syntax for custom error messages
- **trim: true**: removes whitespace "  hello  " → "hello"
- **unique: true**: no two documents can have the same value
- **lowercase: true**: auto-converts to lowercase before saving
- **minlength/maxlength**: character limits with custom error messages
- **timestamps: true**: auto-adds createdAt and updatedAt fields
- **pre('save')**: middleware that runs BEFORE saving to database
- **async pre('save') without next()**: Mongoose handles async promises automatically
- **bcrypt.genSalt(10)**: generates random salt, 10 = cost factor (higher = slower but safer)
- **bcrypt.hash()**: combines password + salt → one-way hash
- **this.isModified('password')**: only hash if password field changed (not on every save)
- **schema.set('toJSON', { transform })**: modify JSON output (remove password)
- **_doc prefix convention**: underscore means "I know this param exists but I'm ignoring it"
- **Schema.Types.ObjectId**: Mongoose type for MongoDB's unique IDs
- **ref: 'User'**: creates a relationship (this field points to a User document)
- **populate()**: follows a ref and fetches the full referenced document
- **default: []**: empty array instead of undefined (prevents .length errors)
- **default: null**: explicitly no value (optional reference)
- **Indexes**: like a book's index — speeds up searching at cost of storage
- **promptSchema.index({ userId: 1 })**: index for fast lookup by userId
- **'text' index**: special MongoDB index for full-text search
- **Compound unique index**: `{ userId: 1, name: 1 }, { unique: true }` — combination must be unique

#### Schemas (Zod Validation)
- **Zod vs Mongoose validation**: Zod validates INPUT (fast, clean errors), Mongoose validates before DB (safety net)
- **z.string().min(1, 'message')**: replaces required_error (no compatibility issues)
- **z.string().email()**: validates email format
- **.toLowerCase()**: transforms input to lowercase
- **.trim()**: removes whitespace from input
- **.optional()**: field can be skipped (undefined)
- **.nullish()**: allows both null AND undefined
- **z.array(z.string())**: array where every item must be a string
- **z.infer<typeof schema>**: auto-generates TypeScript type from Zod schema (types for FREE!)
- **typeof**: in TypeScript, gets the exact type of a variable
- **.transform(Number)**: converts string "2" to number 2
- **.pipe()**: after transform, validate as a different type
- **.split(',').map(tag => tag.trim())**: "a,b,c" → ["a", "b", "c"]
- **val === 'true'**: converts string "true" to boolean true
- **objectId regex**: `/^[0-9a-fA-F]{24}$/` validates MongoDB ObjectId format

#### Error Handling
- **AppError class**: extends Error with statusCode (the ONE exception to "no classes" rule)
- **extends Error + super(message)**: inheritance — AppError gets message, name, stack from Error
- **Error bubbling**: errors travel UP through the call stack until caught
- **Stack trace**: snapshot of the call stack showing WHERE error happened (read top to bottom)
- **Call stack**: JavaScript's tracking of which function called which function
- **instanceof**: checks if an error was created with a specific class
- **?.** (optional chaining): safely access properties that might be undefined
- **?? (nullish coalescing)**: use left side unless it's null/undefined, then use right side
- **'validation' in error**: duck typing — check if property exists on object
- **request.log.error()**: structured logging with request context (better than console.error)
- **Hide 500 errors**: never send internal error details to clients (security!)
- **E11000**: MongoDB duplicate key error code
- **Status codes**: 400 bad input, 401 not logged in, 403 forbidden, 404 not found, 409 conflict, 500 server error
- **fp (fastify-plugin)**: makes plugin global (works everywhere, not just scoped)
- **fastify.setErrorHandler()**: register a function that catches ALL errors

#### Authentication Plugin
- **declare module 'fastify'**: extend existing TypeScript types (add userId to FastifyRequest)
- **Authorization header**: `"Bearer eyJhbGciOi..."` format
- **authHeader.split(' ')[1]**: extracts token from "Bearer <token>"
- **jwt.verify(token, secret)**: decodes token, checks signature, checks expiration
- **as IJwtPayload**: type assertion — tell TypeScript "trust me, this is this type"
- **request.userId = decoded.userId**: attach user info to request for later use
- **fastify.decorate()**: add a new method to the fastify instance

#### Auth System (Repository → Service → Controller → Route)
- **Layered architecture**: each layer has ONE job (Single Responsibility Principle)
  - Route: "which URL goes where?"
  - Controller: "is input valid? send response"
  - Service: "what are the business rules?"
  - Repository: "how do I talk to the database?"
- **Promise<IUser | null>**: async function returns either a user or null
- **UserModel.findOne({ email })**: find one document matching filter
- **UserModel.findById(id)**: find one document by _id
- **UserModel.create(data)**: create and save new document (triggers pre-save hooks)
- **jwt.sign(payload, secret, { expiresIn })**: create a JWT token
- **JWT structure**: header.payload.signature (3 parts separated by dots)
- **Access token (15 min)**: sent with every request, short-lived for security
- **Refresh token (7 days)**: used only to get new access token, long-lived for convenience
- **Two different JWT secrets**: prevents using refresh token as access token
- **bcrypt.compare()**: hashes input and compares with stored hash (never decrypts!)
- **Ambiguous login errors**: "Invalid email or password" (don't reveal which one is wrong)
- **formatUserResponse()**: manually pick safe fields to send (no password)
- **String(user._id)**: convert MongoDB ObjectId to plain string
- **re-throw pattern**: `if (error instanceof AppError) throw error;` — don't catch our own errors
- **registerSchema.safeParse(request.body)**: validate input, returns { success, data/error }
- **Object.values(errors).flat().join(', ')**: convert error object to single string
- **import * as authService**: import all exports as one object (clear naming: authService.login)
- **Status 201**: "Created" — used when a new resource is created
- **preHandler: [fastify.authenticate]**: run function BEFORE the route handler
- **{ prefix: '/api/auth' }**: adds prefix to all routes in a plugin

### Session 3 (Prompt CRUD + Collection CRUD) — 9 mars 2026

#### Repository Pattern (Database Layer)
- **Record<string, any>**: Mongoose type for safe MongoDB query objects
- **Promise.all([query1, query2])**: run multiple database queries in parallel (faster!)
- **Array destructuring**: `const [prompts, total] = await Promise.all([...])`
- **Pagination**: skip = (page - 1) * limit → skip first N results
- **.sort({ createdAt: -1 })**: -1 = newest first, 1 = oldest first
- **.skip(n).limit(n)**: skip N documents, return only N documents
- **Partial<Pick<IPrompt, 'title' | 'content'>>**: pick specific fields, make them all optional
- **findOneAndUpdate()**: find + update in one atomic operation
- **{ $set: data }**: MongoDB operator — update ONLY specified fields
- **{ new: true }**: return the UPDATED document (not the old one)
- **{ runValidators: true }**: run Mongoose validation on update data
- **findOneAndDelete({ _id: id, userId })**: delete only if BOTH _id AND userId match (security!)
- **countDocuments(filter)**: count matching documents without fetching them

#### Service Layer (Business Logic)
- **{ ...data, userId }**: spread operator + add userId from JWT token (not from user input!)
- **Dynamic filter building**: start with `{ userId }`, conditionally add more filters
- **$or operator**: match if ANY condition is true (search in title OR content OR description)
- **$regex with $options: 'i'**: case-insensitive text search
- **$in operator**: match if field contains ANY of the provided values
- **Math.ceil(total / limit)**: round UP for total pages (25 items / 10 per page = 3 pages)
- **collectionId: string | null**: string = move to collection, null = remove from collection
- **updateMany()**: update ALL matching documents (used to unlink prompts from deleted collection)
- **Unlink vs delete**: when deleting a collection, unlink prompts (set null) don't delete them

#### Controller Layer (Input/Output)
- **validate() helper**: reusable Zod validation — one line instead of 5 lines
- **request.body**: data sent in POST/PATCH request body (JSON)
- **request.params**: data from URL path (e.g., /:id → request.params.id)
- **request.query**: data from URL query string (e.g., ?page=2 → request.query.page)
- **Validate params too**: prevent invalid MongoDB ObjectIds from reaching the database
- **ZodSchema<T> generic**: validate helper works with ANY Zod schema

#### Route Layer (URL Mapping)
- **fastify.addHook('preHandler', fn)**: run function before ALL routes in this plugin
- **addHook vs per-route preHandler**: addHook for "all routes need auth", preHandler for individual routes
- **HTTP methods**: POST = create, GET = read, PATCH = partial update, DELETE = remove
- **PATCH vs PUT**: PATCH updates some fields, PUT replaces everything
- **'/' with prefix**: `prefix: '/api/prompts'` + `'/'` = `/api/prompts`
- **'/:id' with prefix**: `prefix: '/api/prompts'` + `'/:id'` = `/api/prompts/:id`

---

## Files Completed
- [x] File 1: package.json (dependencies + scripts)
- [x] File 2: tsconfig.json (TypeScript rules + path aliases)
- [x] File 3: .env + config/env.ts (secrets + validation with Zod)
- [x] File 4: config/db.ts (MongoDB Atlas connection + event listeners)
- [x] File 5: server.ts (entry point — updated with all routes)
- [x] File 6: types/ (4 files — user, prompt, collection, common types)
- [x] File 7: models/User.ts (schema + pre-save password hash + toJSON transform)
- [x] File 8: models/Prompt.ts (schema + 4 search indexes)
- [x] File 9: models/Collection.ts (schema + compound unique index)
- [x] File 10: schemas/ (4 files — auth, prompt, collection, common)
- [x] File 11: plugins/errorHandler.ts (AppError class + 5-case error handler)
- [x] File 11: plugins/authenticate.ts (JWT verification + request.userId)
- [x] File 12: repositories/auth.repository.ts (findByEmail, findById, create)
- [x] File 13: services/auth.service.ts (register, login, refresh, profile)
- [x] File 14: controllers/auth.controller.ts (Zod validation + response)
- [x] File 15: routes/auth.routes.ts (public + protected routes)
- [x] File 16: repositories/prompt.repository.ts (create, findOne, findMany, updateById, deleteById)
- [x] File 17: services/prompt.service.ts (CRUD + search/filter/pagination)
- [x] File 18: controllers/prompt.controller.ts (validate + service calls)
- [x] File 19: routes/prompt.routes.ts (addHook auth + 5 CRUD routes)
- [x] File 20: repositories/collection.repository.ts (create, findOne, findMany, updateById, deleteById)
- [x] File 21: services/collection.service.ts (CRUD + unlink prompts on delete)
- [x] File 22: controllers/collection.controller.ts (validate + service calls)
- [x] File 23: routes/collection.routes.ts (addHook auth + 5 CRUD routes)
- [ ] Final: Testing + Docker + Security plugins

---

## API Endpoints

### Auth (✅ TESTED)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register | ❌ | Create new user |
| POST | /api/auth/login | ❌ | Login, get tokens |
| POST | /api/auth/refresh | ❌ | Refresh access token |
| GET | /api/auth/profile | ✅ | Get current user profile |

### Prompts (✅ TESTED)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/prompts | ✅ | Create new prompt |
| GET | /api/prompts | ✅ | Get all user's prompts (with filters) |
| GET | /api/prompts/:id | ✅ | Get single prompt |
| PATCH | /api/prompts/:id | ✅ | Update prompt |
| DELETE | /api/prompts/:id | ✅ | Delete prompt |

### Collections (✅ DONE)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/collections | ✅ | Create new collection |
| GET | /api/collections | ✅ | Get all user's collections |
| GET | /api/collections/:id | ✅ | Get single collection (with prompts) |
| PATCH | /api/collections/:id | ✅ | Update collection |
| DELETE | /api/collections/:id | ✅ | Delete collection (unlinks prompts) |

### Utility
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /health | ❌ | Server health check |

---

## Current File Structure
```
kodprojekt/nodejs/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── PROGRESS.md
├── bun.lockb
├── node_modules/
└── src/
    ├── server.ts                        ✅
    ├── config/
    │   ├── env.ts                       ✅
    │   └── db.ts                        ✅
    ├── types/
    │   ├── user.types.ts                ✅
    │   ├── prompt.types.ts              ✅
    │   ├── collection.types.ts          ✅
    │   └── common.types.ts              ✅
    ├── models/
    │   ├── User.ts                      ✅
    │   ├── Prompt.ts                    ✅
    │   └── Collection.ts               ✅
    ├── schemas/
    │   ├── auth.schema.ts               ✅
    │   ├── prompt.schema.ts             ✅
    │   ├── collection.schema.ts         ✅
    │   └── common.schema.ts             ✅
    ├── plugins/
    │   ├── errorHandler.ts              ✅
    │   └── authenticate.ts              ✅
    ├── utils/
    │   └── validate.ts                  ✅
    ├── repositories/
    │   ├── auth.repository.ts           ✅
    │   ├── prompt.repository.ts         ✅
    │   └── collection.repository.ts     ✅
    ├── services/
    │   ├── auth.service.ts              ✅
    │   ├── prompt.service.ts            ✅
    │   └── collection.service.ts        ✅
    ├── controllers/
    │   ├── auth.controller.ts           ✅
    │   ├── prompt.controller.ts         ✅
    │   └── collection.controller.ts     ✅
    └── routes/
        ├── auth.routes.ts               ✅
        ├── prompt.routes.ts             ✅
        └── collection.routes.ts         ✅
```

---

## How to Resume in New Chat
Paste this message:
"I'm building an AI Prompt Manager backend. Here is my PROGRESS.md
and my current file structure. All CRUD is complete and tested.
We build file by file, functional style, educational approach.
We left off at: Final phase — Testing + Docker + Security plugins."
Then attach PROGRESS.md.