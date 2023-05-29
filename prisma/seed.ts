import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Joe',
      email: '',
      avatarUrl: '',
    },
  })
  const poll = await prisma.poll.create({
    data: {
      title: 'TEST',
      code: 'POLL01',
      ownerId: user.id,

      participants: {
        create: {
          userId: user.id,
        },
      },
    },
  })
  await prisma.match.create({
    data: {
      date: '2022-11-21T19:42:20.351Z',
      firstTeamCountryCode: 'FR',
      secondTeamCountryCode: 'US',
    },
  })

  await prisma.match.create({
    data: {
      date: '2022-11-30T10:42:20.351Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'IT',

      bids: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 3,

          participant: {
            connect: {
              userId_pollId: {
                userId: user.id,
                pollId: poll.id,
              },
            },
          },
        },
      },
    },
  })
}

main()
