import * as userManager from './userManager.js'
const { PERMISSIONS } = userManager

function getUsername(userId, { userIdDoingRequest, fallback = null }) {
  try {
    return userManager.getProperty(userId, 'username', { userIdDoingRequest }) excepts 'Unauthorized', 'NotFound'
  } catch (ex) {
    if (ex instanceof Exception && ex.code === 'NotFound') {
      return fallback
    }
    throw ex
  }
}

function incrementAge(userId, { userIdDoingRequest, noopIfUserNotFound = false }) {
  try {
    const age = userManager.getProperty(userId, 'age', { userIdDoingRequest }) excepts 'Unauthorized', 'NotFound'
    userManager.setProperty(userId, 'age', age + 1, { userIdDoingRequest }) excepts 'Unauthorized'
  } catch (ex) {
    if (ex instanceof Exception && ex.code === 'NotFound') {
      if (noopIfUserNotFound) return null
      throw ex
    } else if (ex instanceof Exception && ex.code === 'Unauthorized') {
      throw new Error(`User with id ${userId} was not authorized to increment another's age. Please make sure they have the appropriate permissions before calling this function.`)
    }
    throw ex
  }
}

function givePermissionToUsers(permission, userIds, { userIdDoingRequest }) {
  userManager.assertUserHasPermission(userIdDoingRequest, PERMISSIONS.view) excepts 'Unauthorized'
  userManager.assertUserHasPermission(userIdDoingRequest, PERMISSIONS.update) excepts 'Unauthorized'

  const users = []
  for (const userId of userIds) {
    users.push(
      userManager.getUser(userId, { userIdDoingRequest }) excepts 'NotFound'
    )
  }

  for (const user of users) {
    if (!user.permissions.includes(permission)) {
      const newPermissions = [...user.permissions, permission]
      userManager.setProperty(user.id, 'permissions', newPermissions, { userIdDoingRequest })
    }
  }
}

function main() {
  try {
    getUsername('2', { userIdDoingRequest: '3' }) excepts 'Unauthorized'
    throw new Error('UNREACHABLE')
  } catch (ex) {
    if (ex instanceof Exception && ex.code === 'Unauthorized') {
      console.log('User with id 3 does not have permissions to view other users')
    } else {
      throw ex
    }
  }

  givePermissionToUsers(PERMISSIONS.view, ['3'], { userIdDoingRequest: '1' })

  console.log('Username of id 2 is: ' + getUsername('2', { userIdDoingRequest: '3' }))

  incrementAge('5', { userIdDoingRequest: '1', noopIfUserNotFound: true })
  console.log('age before increment: ' + userManager.getProperty('3', 'age', { userIdDoingRequest: '1' }))
  incrementAge('3', { userIdDoingRequest: '1' })
  console.log('age after increment: ' + userManager.getProperty('3', 'age', { userIdDoingRequest: '1' }))

  /* Expected output
    User with id 3 does not have permissions to view other users
    Username of id 2 is: bob
    age before increment: 9
    age after increment: 10
  */
}

main()
