import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { User } from '@/types/user'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function POST(request: Request) {
    try {
        const userData: User = await request.json()

        // Validate required fields
        if (!userData.email || !userData.password || !userData.name || !userData.age || !userData.weight || !userData.height) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Read existing users
        let users: User[] = []
        try {
            const fileContent = await fs.readFile(DATA_FILE, 'utf-8')
            users = JSON.parse(fileContent)
        } catch (error) {
            // File doesn't exist yet, start with empty array
            users = []
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === userData.email)
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        // Add new user
        users.push(userData)

        // Ensure data directory exists
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })

        // Write updated users
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2))

        // Return user without password
        const { password, ...userWithoutPassword } = userData
        return NextResponse.json({ user: userWithoutPassword }, { status: 201 })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
