import { fireEvent, render } from '@testing-library/react-native';

import { useAnimalOptionPhoto, type AnimalOption } from '@/application/animals';
import type { VeterinarianDirectoryEntry } from '@/application/veterinarians';

import type { ClinicalAttachment, MedicalRecord } from '../types';
import { MedicalRecordDetail } from './MedicalRecordDetail';

jest.mock('@/application/animals', () => ({ useAnimalOptionPhoto: jest.fn() }));

const mockAnimalPhoto = useAnimalOptionPhoto as jest.Mock;
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const RECORD_ID = '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14';

const animal: AnimalOption = {
  id: ANIMAL_ID,
  name: 'Luna',
  species: 'Gata',
  breed: 'Mestiza',
  profilePhotoMediaId: 'media-photo',
};

const veterinarian: VeterinarianDirectoryEntry = {
  id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'Sofía Gómez',
  licenseNumber: 'MP 100',
};

function record(overrides: Partial<MedicalRecord> = {}): MedicalRecord {
  return {
    id: RECORD_ID,
    animalId: ANIMAL_ID,
    veterinarianId: veterinarian.id,
    recordType: 'consultation',
    title: 'Control general',
    diagnosis: 'Inflamación leve',
    treatment: 'Continuar medicación',
    notes: null,
    occurredAt: '2026-09-21T13:30:00.000Z',
    createdAt: '2026-09-21T14:05:00.000Z',
    updatedAt: '2026-09-21T14:05:00.000Z',
    ...overrides,
  };
}

const attachments: ClinicalAttachment[] = [
  {
    bytes: 180 * 1024,
    format: 'pdf',
    id: 'media-1',
    name: 'indicaciones.pdf',
    resourceType: 'raw',
    secureUrl: 'https://cdn.test/indicaciones.pdf',
  },
];

function renderDetail(overrides: Partial<React.ComponentProps<typeof MedicalRecordDetail>> = {}) {
  return render(
    <MedicalRecordDetail
      animal={animal}
      attachments={attachments}
      canWrite
      onDelete={jest.fn()}
      onEdit={jest.fn()}
      onOpenAnimal={jest.fn()}
      onOpenAttachment={jest.fn()}
      record={record()}
      veterinarian={veterinarian}
      {...overrides}
    />
  );
}

describe('MedicalRecordDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnimalPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
  });

  it('renders the resolved identities, clinical information and attachments', async () => {
    const screen = await renderDetail();

    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getByText('Gata · Mestiza')).toBeTruthy();
    expect(screen.getByText('Consulta')).toBeTruthy();
    expect(screen.getByText('Control general')).toBeTruthy();
    expect(screen.getByText('Sofía Gómez')).toBeTruthy();
    expect(screen.getByText('Inflamación leve')).toBeTruthy();
    expect(screen.getByText('Continuar medicación')).toBeTruthy();
    expect(screen.getByText('Sin información registrada.')).toBeTruthy();
    expect(screen.getByText('indicaciones.pdf')).toBeTruthy();
    expect(screen.getByText('PDF · 180 KB')).toBeTruthy();
  });

  it('opens the animal and one attachment through explicit accessible actions', async () => {
    const onOpenAnimal = jest.fn();
    const onOpenAttachment = jest.fn();
    const screen = await renderDetail({ onOpenAnimal, onOpenAttachment });

    await fireEvent.press(screen.getByTestId('medical-record-animal'));
    await fireEvent.press(screen.getByTestId('medical-record-attachment-media-1'));

    expect(onOpenAnimal).toHaveBeenCalledTimes(1);
    expect(onOpenAttachment).toHaveBeenCalledWith(attachments[0]);
  });

  it('requires confirmation before soft-delete', async () => {
    const onDelete = jest.fn();
    const screen = await renderDetail({ onDelete });

    await fireEvent.press(screen.getByTestId('medical-record-delete'));
    expect(onDelete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('confirm-accept'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('hides write actions when the capability is lost', async () => {
    const screen = await renderDetail({ canWrite: false });

    expect(screen.queryByTestId('medical-record-edit')).toBeNull();
    expect(screen.queryByTestId('medical-record-delete')).toBeNull();
    expect(screen.getByText(/Tu rol permite consultar/)).toBeTruthy();
  });

  it('explains when the record has no attachments or assigned veterinarian', async () => {
    const screen = await renderDetail({
      attachments: [],
      record: record({ veterinarianId: null }),
      veterinarian: null,
    });

    expect(screen.getByText('Sin veterinario asignado')).toBeTruthy();
    expect(screen.getByText('Sin adjuntos registrados.')).toBeTruthy();
  });
});
