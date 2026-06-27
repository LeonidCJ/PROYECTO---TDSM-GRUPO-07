import {
  createStudy,
  getStudy,
  listStudies,
  uploadImage,
} from '@/src/features/studies/data/studiesApi';

function mockFetch(response: Partial<Response> & { json?: () => Promise<any> }) {
  (global as any).fetch = jest.fn().mockResolvedValue(response);
}

describe('studiesApi.uploadImage', () => {
  afterEach(() => jest.resetAllMocks());

  it('devuelve la imagen serializada cuando la respuesta es OK', async () => {
    const body = { id: 'img-1', inference_result: { primary_label: 'NTL' } };
    mockFetch({ ok: true, status: 201, json: async () => body });

    const result = await uploadImage('tok', 'study-1', 'file:///x.jpg', 'gallery');
    expect(result).toEqual(body);
  });

  it('lanza MODEL_UNAVAILABLE ante un 503', async () => {
    mockFetch({ ok: false, status: 503, json: async () => ({}) });
    await expect(uploadImage('tok', 's', 'file:///x.jpg')).rejects.toThrow('MODEL_UNAVAILABLE');
  });

  it('usa el detail (string) cuando el backend devuelve un error con mensaje', async () => {
    mockFetch({ ok: false, status: 400, json: async () => ({ detail: 'La imagen no es válida' }) });
    await expect(uploadImage('tok', 's', 'file:///x.jpg')).rejects.toThrow('La imagen no es válida');
  });

  it('usa mensaje genérico cuando el detail es un arreglo (422 de DRF)', async () => {
    mockFetch({
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ msg: 'Field required', loc: ['body', 'image'] }] }),
    });
    await expect(uploadImage('tok', 's', 'file:///x.jpg')).rejects.toThrow('Error al procesar la imagen');
  });
});

describe('studiesApi.createStudy', () => {
  afterEach(() => jest.resetAllMocks());

  it('devuelve el estudio creado cuando la respuesta es OK', async () => {
    const body = { id: 's1', reference_code: 'CY-2026-0001' };
    mockFetch({ ok: true, status: 201, json: async () => body });
    const result = await createStudy('tok', { patient: 'p1' });
    expect(result).toEqual(body);
  });

  it('lanza error cuando la creación falla', async () => {
    mockFetch({ ok: false, status: 400, json: async () => ({ patient: ['requerido'] }) });
    await expect(createStudy('tok', { patient: '' })).rejects.toThrow();
  });
});

describe('studiesApi.getStudy / listStudies', () => {
  afterEach(() => jest.resetAllMocks());

  it('getStudy lanza error ante respuesta no OK', async () => {
    mockFetch({ ok: false, status: 404, json: async () => ({}) });
    await expect(getStudy('tok', 'x')).rejects.toThrow('No se pudo obtener el estudio');
  });

  it('listStudies devuelve el arreglo cuando es OK', async () => {
    const body = [{ id: 's1' }, { id: 's2' }];
    mockFetch({ ok: true, status: 200, json: async () => body });
    const result = await listStudies('tok');
    expect(result).toHaveLength(2);
  });
});
