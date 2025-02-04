export default function getUserFromDb(email: string) {
  return prisma.user.findFirst({
    where: {
      email
    }
  });
} 