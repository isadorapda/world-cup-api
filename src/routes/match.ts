import { FastifyInstance } from 'fastify/types/instance'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function matchRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/polls/:id/matches',
    { onRequest: [authenticate] },
    async (request) => {
      const getPollParams = z.object({
        id: z.string(),
      })

      const { id } = getPollParams.parse(request.params)
      const matches = await prisma.match.findMany({
        orderBy: {
          date: 'desc',
        },
        include: {
          bids: {
            where: {
              participant: {
                userId: request.user.sub,
                pollId: id,
              },
            },
          },
        },
      })
      return {
        matches: matches.map((match) => {
          return {
            ...match,
            bid: match.bids.length > 0 ? match.bids[0] : null,
            bids: undefined,
          }
        }),
      }
    }
  )
}
