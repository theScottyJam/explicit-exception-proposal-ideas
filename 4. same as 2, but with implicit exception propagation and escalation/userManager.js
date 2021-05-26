import { users } from './exampleData.js'

export const PERMISSIONS = {
  view: 'VIEW',
  update: 'UPDATE',
}

export class UnauthorizedEx extends Exception {}
export class NotFoundEx extends Exception {}
export class MissingPropEx extends Exception {}

export function getUser(userId, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx {
  assertUserHasPermission(userIdDoingRequest, PERMISSIONS.view)

  const user = users.get(userId)
  if (!user) {
    throw new NotFoundEx()
  }
  return user
}

export function getProperty(userId, propName, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx, MissingPropEx {
  const user = getUser(userId, { userIdDoingRequest })

  if (Object.prototype.hasOwnProperty.call(user, propName)) {
    return user[propName]
  } else {
    throw new MissingPropEx(`The property "${propName}" does not exist on the provided user.`)
  }
}

export function setProperty(userId, propName, value, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx, MissingPropEx {
  assertUserHasPermission(userIdDoingRequest, PERMISSIONS.update)

  const user = getUser(userId, { userIdDoingRequest })
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
