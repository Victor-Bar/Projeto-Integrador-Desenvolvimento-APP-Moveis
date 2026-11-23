const crypto = require('node:crypto');

const userColumns = 'id, username, email, address, password_hash AS "passwordHash"';

function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        address: user.address || '',
    };
}

function userDetails(user) {
    const { password, passwordHash, ...details } = user;
    return details;
}

function contactFromRow(row) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        relationship: row.relationship,
    };
}

function sosRequestFromRow(row) {
    return {
        id: row.id,
        userId: row.user_id,
        createdAt: new Date(row.created_at).toISOString(),
        status: row.status,
        notes: row.notes,
        ...(row.updated_at ? { updatedAt: new Date(row.updated_at).toISOString() } : {}),
        caller: userDetails(row.caller || {}),
    };
}

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isUniqueViolation(error) {
    return error.code === '23505';
}

function normalizeContact(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return null;
    }

    return {
        name: typeof input.name === 'string' ? input.name.trim() : '',
        phone: typeof input.phone === 'string' ? input.phone.trim() : '',
        relationship: typeof input.relationship === 'string' ? input.relationship.trim() : '',
    };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
    const [salt, savedHash] = passwordHash.split(':');
    const candidate = Buffer.from(hashPassword(password, salt).split(':')[1], 'hex');
    const expected = Buffer.from(savedHash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function createToken(user, jwtSecret) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    })).toString('base64url');
    const signature = crypto
        .createHmac('sha256', jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');
    return `${header}.${payload}.${signature}`;
}

module.exports = {
    contactFromRow,
    createToken,
    hashPassword,
    isUniqueViolation,
    isUuid,
    normalizeContact,
    publicUser,
    sosRequestFromRow,
    userColumns,
    userDetails,
    verifyPassword,
};
