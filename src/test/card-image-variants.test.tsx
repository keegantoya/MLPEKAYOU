import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
const mocks = vi.hoisted(() => ({
  sign: vi.fn(async (paths: string[]) => ({ data: paths.map(path => ({ signedUrl: `https://images.example/${path}`, error: null })), error: null })),
  bytes: vi.fn(async (_path: string, _user: string, sign: () => Promise<string | undefined>) => {
    const url = await sign();
    return url ? { url, release: () => {} } : undefined;
  }),
}));
vi.mock("@/lib/supabase", () => ({ supabase: {
  auth: { getSession: async () => ({ data: { session: { user: { id: "test" } } } }), onAuthStateChange: vi.fn() },
  storage: { from: () => ({ createSignedUrls: mocks.sign }) },
} }));
vi.mock("@/lib/card-image-cache", () => ({ getCachedCardImage: mocks.bytes, suspendCardImageLoads: vi.fn() }));
vi.mock("@/lib/card-image-thumbnails", () => ({ cardImageThumbnails: {
  "cards/test/a.webp": "grid-v1/a.webp", "cards/test/b.webp": "grid-v1/b.webp",
  "cards/test/c.webp": "grid-v1/c.webp", "cards/test/hidden.webp": "grid-v1/hidden.webp",
} }));
import CardImage from "@/components/CardImage";
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("uses a thumbnail for grids and the original when zoom opens", async () => {
  const view = render(<CardImage src="/cards/test/a.webp" loading="eager" alt="card" />);
  const img = view.getByAltText("card");
  await waitFor(() => expect(img.getAttribute("src")).toBe("https://images.example/grid-v1/a.webp"));
  view.rerender(<CardImage src="/cards/test/a.webp" loading="eager" imageSize="original" alt="card" />);
  await waitFor(() => expect(img.getAttribute("src")).toBe("https://images.example/cards/test/a.webp"));
  expect(img.hasAttribute("imageSize")).toBe(false);
});
it("falls back to the original on a failed thumbnail image without looping", async () => {
  const view = render(<CardImage src="/cards/test/b.webp" loading="eager" alt="card" />);
  const img = view.getByAltText("card");
  await waitFor(() => expect(img.getAttribute("src")).toContain("grid-v1/b.webp"));
  fireEvent.error(img);
  await waitFor(() => expect(img.getAttribute("src")).toBe("https://images.example/cards/test/b.webp"));
  expect(mocks.bytes.mock.calls.map(call => call[0])).toEqual(["grid-v1/b.webp", "cards/test/b.webp"]);
});
it("falls back if signing a thumbnail fails", async () => {
  mocks.bytes.mockResolvedValueOnce(undefined);
  const view = render(<CardImage src="/cards/test/c.webp" loading="eager" alt="card" />);
  await waitFor(() => expect(view.getByAltText("card").getAttribute("src")).toBe("https://images.example/cards/test/c.webp"));
});
it("keeps images without an uploaded thumbnail working", async () => {
  const view = render(<CardImage src="/cards/test/new.webp" loading="eager" alt="card" />);
  await waitFor(() => expect(view.getByAltText("card").getAttribute("src")).toBe("https://images.example/cards/test/new.webp"));
});
it("does not fetch an invisible card face", async () => {
  render(<CardImage src="/cards/test/hidden.webp" visible={false} loading="eager" alt="card" />);
  expect(mocks.bytes).not.toHaveBeenCalled();
});
