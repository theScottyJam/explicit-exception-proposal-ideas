import * as userManager from './userManager.js'
const { PERMISSIONS, UnauthorizedEx, NotFoundEx, MissingPropEx } = userManager

function getUsername(userId, { userIdDoingRequest, fallback = null }) throws UnauthorizedEx {
  try {
    return userManager.getProperty(userId, 'username', { userIdDoingRequest })
  } catch NotFoundEx {
    return fallback
  } catch UnauthorizedEx (ex) {
    throw ex
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }
}

function incrementAge(userId, { userIdDoingRequest, noopIfUserNotFound = false }) throws NotFoundEx {
  let age
  try {
    age = userManager.getProperty(userId, 'age', { userIdDoingRequest })
  } catch NotFoundEx (ex) {
    if (noopIfUserNotFound) return null
    throw ex
  } catch UnauthorizedEx {
    throw new Error(`User with id ${userId} was not authorized to increment another's age. Please make sure they have the appropriate permissions before calling this function.`)
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  try {
    userManager.setProperty(userId, 'age', age + 1, { userIdDoingRequest })
  } catch UnauthorizedEx {
    throw new Error(`User with id ${userId} was not authorized to increment another's age. Please make sure they have the appropriate permissions before calling this function.`)
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }
}

function givePermissionToUsers(permission, userIds, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx {
  try {
    userManager.assertUserHasPermission(userIdDoingRequest, PERMISSIONS.view)
    userManager.assertUserHasPermission(userIdDoingRequest, PERMISSIONS.update)
  } catch UnauthorizedEx (ex) {
    throw ex
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  const users = []
  for (const userId of userIds) {
    let user
    try {
      user = userManager.getUser(userId, { userIdDoingRequest })
    } catch NotFoundEx (ex) {
      throw ex
    } catch Exception (ex) {
      throw new Error(`Unexpected exception: ${ex.message}`)
    }
  
    users.push(user)
  }

  for (const user of users) {
    if (!user.permissions.includes(permission)) {
      const newPermissions = [...user.permissions, permission]
      try {
        userManager.setProperty(user.id, 'permissions', newPermissions, { userIdDoingRequest })
      } catch Exception (ex) {
        throw new Error(`Unexpected exception: ${ex.message}`)
      }
    }
  }
}

function main() {
  try {
    getUsername('2', { userIdDoingRequest: '3' })
    throw new Error('UNREACHABLE')
  } catch UnauthorizedEx {
    console.log('User with id 3 does not have permissions to view other users')
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  try {
    givePermissionToUsers(PERMISSIONS.view, ['3'], { userIdDoingRequest: '1' })
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  let usernameOfId2
  try {
    usernameOfId2 = getUsername('2', { userIdDoingRequest: '3' })
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }
  console.log('Username of id 2 is: ' + usernameOfId2)

  const getAgeOfId3 = () => {
    try {
      return userManager.getProperty('3', 'age', { userIdDoingRequest: '1' })
    } catch Exception (ex) {
      throw new Error(`Unexpected exception: ${ex.message}`)
    }
  }

  try {
    incrementAge('5', { userIdDoingRequest: '1', noopIfUserNotFound: true })
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  console.log('age before increment: ' + getAgeOfId3())

  try {
    incrementAge('3', { userIdDoingRequest: '1' })
  } catch Exception (ex) {
    throw new Error(`Unexpected exception: ${ex.message}`)
  }

  console.log('age after increment: ' + getAgeOfId3())

  /* Expected output
    User with id 3 does not have permissions to view other users
    Username of id 2 is: bob
    age before increment: 9
    age after increment: 10
  */
}

main()
