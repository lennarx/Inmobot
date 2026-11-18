import { listPhotos } from "@/lib/data";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoGrid } from "@/components/PhotoGrid";

export const dynamic = "force-dynamic";

export default async function MyLivingPage() {
  const photos = await listPhotos(null);
  return (
    <main className="space-y-4 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Mi living actual 🛋️</h1>
        <p className="text-sm text-muted">Sacá 2-3 fotos desde distintos ángulos donde se vean bien todos tus muebles. La IA las usa para amueblar cada depto.</p>
      </header>
      <PhotoUploader apartmentId={null} kind="my_living" label="Agregar fotos" />
      <PhotoGrid photos={photos} />
    </main>
  );
}
