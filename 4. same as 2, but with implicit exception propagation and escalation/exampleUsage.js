import * as userManager from './userManager.js'
const { PERMISSIONS, UnauthorizedEx, NotFoundEx, MissingPropEx } = userManager

function getUsername(userId, { userIdDoingRequest, fallback = null }) throws UnauthorizedEx {
  try {
    return userManager.getProperty(userId, 'username', { userIdDoingRequest })
  } catch NotFoundEx {
    return fallback
  } catch MissingPropEx {
    throw new Error('Unexpected failure to find the username property.')
  }
}

function incrementAge(userId, { userIdDoingRequest, noopIfUserNotFound = false }) throws NotFoundEx {
  try {
    const age = userManager.getProperty(userId, 'age', { userIdDoingRequest })
    userManager.setProperty(userId, 'age', age + 1, { userIdDoingRequest })
  } catch NotFoundEx (ex) {
    if (noopIfUserNotFound) return null
    throw ex
  } catch UnauthorizedEx {
    throw new Error(`User with id ${userId} was not authorized to increment another's age. Please make sure they have the appropriate permissions before calling this function.`)
  } catch MissingPropEx {
    throw new Error('Unexpected failure to find the age property. please make sure the user has an age property before calling this function.')
  }
}

function givePermissionToUsers(permission, userIds, { userIdDoingRequest }) throws UnauthorizedEx, NotFoundEx {
  userManager.assertUserHasPermission(userIdDoingRequest, PERMISSIONS.view)
  userManager.assertUserHasPermission(userIdDoingRequest, PERMISSIONS.update)

  // Get every users in the first place, so that if a NoFound exception occurs
  // we don't start making modifications to the users and stop halfway through
  const users = [];
  for (const userId of userIds) {
    users.push(
      userManager.getUser(userId, { userIdDoingRequest })
    )
  }

  for (const user of users) {
    if (!user.permissions.includes(permission)) {
      const newPermissions = [...user.permissions, permission]
      try {
        userManager.setProperty(user.id, 'permissions', newPermissions, { userIdDoingRequest })
      } catch MissingPropEx {
        throw new Error('Unexpected failure to find the permissions property')
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
  }

  try {
    givePermissionToUsers(PERMISSIONS.view, ['3'], { userIdDoingRequest: '1' })
  } catch UnauthorizedEx {
    throw new Error('Unexpected authorization failure - an admin user was used.')
  } catch NotFoundEx {
    throw new Error('Unexpected NotFound exception - This user should always be present.')
  }

  let usernameOfId2
  try {
    usernameOfId2 = getUsername('2', { userIdDoingRequest: '3' })
  } catch UnauthorizedEx {
    throw new Error('Unexpected authorization failure - user with ID 3 should have permissions now.')
  }
  console.log('Username of id 2 is: ' + usernameOfId2)

  const getAgeOfId3 = () => {
    try {
      return userManager.getProperty('3', 'age', { userIdDoingRequest: '1' })
    } catch UnauthorizedEx {
      throw new Error('Unexpected authorization failure - an admin user was used.')
    } catch NotFoundEx {
      throw new Error('Unexpected NotFound exception - this user should exist')
    } catch MissingPropEx {
      throw new Error('Unexpected MissinProp exception - this user should have an age property')
    }
  }

  try {
    incrementAge('5', { userIdDoingRequest: '1', noopIfUserNotFound: true })
  } catch NotFoundEx {
    throw new Error('Unexpected NotFound exception - It was set to NO-OP if NotFound occured.')
  }

  console.log('age before increment: ' + getAgeOfId3())

  try {
    incrementAge('3', { userIdDoingRequest: '1' })
  } catch NotFoundEx (ex) {
    throw new Error('Unexpected NotFound exception - this user should exist')
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
