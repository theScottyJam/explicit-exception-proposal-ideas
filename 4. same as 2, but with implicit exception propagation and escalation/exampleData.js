export const users = new Map(Object.entries({
  '1': {
    id: '1',
    username: 'admin',
    permissions: ['VIEW', 'UPDATE'],
  },
  '2': {
    id: '2',
    username: 'bob',
    permissions: ['VIEW'],
    age: 7,
  },
  '3': {
    id: '3',
    username: 'sally',
    permissions: [],
    age: 9,
  },
}))
