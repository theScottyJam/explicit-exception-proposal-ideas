import { users } from './exampleData.js'

export const PERMISSIONS = {
  view: 'VIEW',
  update: 'UPDATE',
}

export class UnauthorizedEx extends Exception {}
export class NotFoundEx extends Exception {}
export class MissingPropEx extends Exception {}

export function getUser(userId, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx {
  try {
    assertUserHasPermission(userIdDoingRequest, PERMISSIONS.view)
  } catch UnauthorizedEx (ex) {
    throw ex
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  const user = users.get(userId)
  if (!user) {
    throw new NotFoundEx()
  }
  return user
}

export function getProperty(userId, propName, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx, MissingPropEx {
  let user
  try {
    user = getUser(userId, { userIdDoingRequest })
  } catch UnauthorizedEx, NotFoundEx (ex) {
    throw ex
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  if (Object.prototype.hasOwnProperty.call(user, propName)) {
    return user[propName]
  } else {
    throw new MissingPropEx(`The property "${propName}" does not exist on the provided user.`)
  }
}

export function setProperty(userId, propName, value, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx, MissingPropEx {
  try {
    assertUserHasPermission(userIdDoingRequest, PERMISSIONS.update)
  } catch UnauthorizedEx (ex) {
    throw ex
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  let user
  try {
    user = getUser(userId, { userIdDoingRequest })
  } catch UnauthorizedEx, NotFoundEx (ex) {
    throw ex
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  if (!Object.prototype.hasOwnProperty.call(user, propName)) {
    throw new MissingPropEx()
  }

  user[propName] = value
}

export function assertUserHasPermission(userId, permission) throws UnauthorizedEx {
  const user = users.get(userId)
  if (!user) {
    throw new Error('The ID of the user doing the request was not found.')
  }

  if (!user.permissions.includes(permission)) {
    throw new UnauthorizedEx()
  }
}
