import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { User } from '@/types/user'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Read users file
        let users: User[] = []
        try {
            const fileContent = await fs.readFile(DATA_FILE, 'utf-8')
            users = JSON.parse(fileContent)
        } catch (error) {
            return NextResponse.json(
                { error: 'No users found. Please sign up first.' },
                { status: 404 }
            )
        }

        // Find user
        const user = users.find(u => u.email === email && u.password === password)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user
        return NextResponse.json({ user: userWithoutPassword }, { status: 200 })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
