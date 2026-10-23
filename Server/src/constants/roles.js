export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  OWNER: 'owner',
  RECEPTIONIST: 'receptionist',
  TEACHER: 'teacher',
})

export const ROLE_LABELS = Object.freeze({
  super_admin: 'Super Admin',
  admin: 'Admin',
  owner: 'Owner',
  receptionist: 'Receptionist',
  teacher: 'Teacher',
})

export const isKnownRole = (role) => Object.values(ROLES).includes(role)
