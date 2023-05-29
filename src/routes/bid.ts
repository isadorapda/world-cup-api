import { FastifyInstance } from 'fastify/types/instance'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function bidRoutes(fastify: FastifyInstance) {
  fastify.get('/bids/count', async () => {
    const count = await prisma.bid.count()
    return { count }
  })

  fastify.post(
    '/polls/:pollId/matches/:matchId/bids',
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const createBidParms = z.object({
        pollId: z.string(),
        matchId: z.string(),
      })
      const createBidBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      })

      const { pollId, matchId } = createBidParms.parse(request.params)
      const { firstTeamPoints, secondTeamPoints } = createBidBody.parse(
        request.body
      )

      const participant = await prisma.participant.findUnique({
        where: {
          userId_pollId: {
            pollId,
            userId: request.user.sub,
          },
        },
      })

      if (!participant) {
        return reply.status(400).send({
          message: "You're not allowed to make bids in this poll.",
        })
      }

      const bid = await prisma.bid.findUnique({
        where: {
          participantId_matchId: {
            participantId: participant.id,
            matchId,
          },
        },
      })

      if (bid) {
        return reply.status(400).send({
          message: 'You already sent a guess to this game on this pool.',
        })
      }

      const match = await prisma.match.findUnique({
        where: {
          id: matchId,
        },
      })

      if (!match) {
        return reply.status(400).send({
          message: 'Game not found.',
        })
      }

      if (match.date < new Date()) {
        return reply.status(400).send({
          message: 'You cannot send guesses after the game date.',
        })
      }

      await prisma.bid.create({
        data: {
          matchId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      })

      return reply.status(201).send()
    }
  )
}
