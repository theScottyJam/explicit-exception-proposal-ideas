import { users } from './exampleData.js'

export const PERMISSIONS = {
  view: 'VIEW',
  update: 'UPDATE',
}

export function getUser(userId, { userIdDoingRequest }) {
  assertUserHasPermission(userIdDoingRequest, PERMISSIONS.view) excepts 'Unauthorized'

  const user = users.get(userId)
  if (!user) {
    throw new Exception('NotFound')
  }
  return user
}

export function getProperty(userId, propName, { userIdDoingRequest }) {
  const user = getUser(userId, { userIdDoingRequest }) excepts 'Unauthorized', 'NotFound'

  if (Object.prototype.hasOwnProperty.call(user, propName)) {
    return user[propName]
  } else {
    throw new Exception('MissingProp', `The property "${propName}" does not exist on the provided user.`)
  }
}

export function setProperty(userId, propName, value, { userIdDoingRequest }) {
  assertUserHasPermission(userIdDoingRequest, PERMISSIONS.update) excepts 'Unauthorized'
  const user = getUser(userId, { userIdDoingRequest }) excepts 'Unauthorized', 'NotFound'
  if (!Object.prototype.hasOwnProperty.call(user, propName)) {
    throw new Exception('MissingProp')
  }

  user[propName] = value
}

export function assertUserHasPermission(userId, permission) {
  const user = users.get(userId)
  if (!user) {
    throw new Error('The ID of the user doing the request was not found.')
  }

  if (!user.permissions.includes(permission)) {
    throw new Exception('Unauthorized')
  }
}
