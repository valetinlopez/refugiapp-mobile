export const adoptionKeys = {
  all: ['adoptions'] as const,
  animal: (animalId: string) => [...adoptionKeys.all, 'animal', animalId] as const,
  applications: (animalId: string) => [...adoptionKeys.animal(animalId), 'applications'] as const,
  history: (animalId: string) => [...adoptionKeys.animal(animalId), 'history'] as const,
  adopter: (adopterId: string) => [...adoptionKeys.all, 'adopter', adopterId] as const,
};
