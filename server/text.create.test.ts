import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as gemini from "./lib/gemini";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "google",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("text.create with auto title generation", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it("generates title using AI when title is not provided", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const dutchText = "Nederland is een land in West-Europa. Het heeft een lange geschiedenis en een rijke cultuur. Amsterdam is de hoofdstad van Nederland.";

    // Mock gemini.generateTitle
    const mockGenerateTitle = vi.spyOn(gemini, "generateTitle");
    mockGenerateTitle.mockResolvedValue("Nederland: Geschiedenis en Cultuur");

    // Mock db.createText
    const mockCreateText = vi.spyOn(db, "createText");
    mockCreateText.mockResolvedValue([{ id: 123 }] as any);

    const result = await caller.text.create({
      dutch_text: dutchText,
      // No title provided
      source: "paste",
    });

    // Verify generateTitle was called
    expect(mockGenerateTitle).toHaveBeenCalledWith(dutchText);

    // Verify createText was called with generated title
    expect(mockCreateText).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nederland: Geschiedenis en Cultuur",
        dutch_text: dutchText,
      })
    );

    expect(result.success).toBe(true);
    expect(result.text_id).toBe(123);
  });

  it("uses provided title when title is given", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const dutchText = "Nederland is een land in West-Europa. Het heeft een lange geschiedenis en een rijke cultuur.";
    const providedTitle = "Mijn Custom Titel";

    // Mock gemini.generateTitle
    const mockGenerateTitle = vi.spyOn(gemini, "generateTitle");

    // Mock db.createText
    const mockCreateText = vi.spyOn(db, "createText");
    mockCreateText.mockResolvedValue([{ id: 456 }] as any);

    const result = await caller.text.create({
      dutch_text: dutchText,
      title: providedTitle,
      source: "paste",
    });

    // Verify generateTitle was NOT called
    expect(mockGenerateTitle).not.toHaveBeenCalled();

    // Verify createText was called with provided title
    expect(mockCreateText).toHaveBeenCalledWith(
      expect.objectContaining({
        title: providedTitle,
        dutch_text: dutchText,
      })
    );

    expect(result.success).toBe(true);
    expect(result.text_id).toBe(456);
  });

  it("falls back to truncated text when AI title generation fails", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const dutchText = "Dit is een korte Nederlandse tekst voor testing purposes. Het moet lang genoeg zijn om de minimale lengte te halen.";

    // Mock gemini.generateTitle to throw error
    const mockGenerateTitle = vi.spyOn(gemini, "generateTitle");
    mockGenerateTitle.mockRejectedValue(new Error("AI service unavailable"));

    // Mock db.createText
    const mockCreateText = vi.spyOn(db, "createText");
    mockCreateText.mockResolvedValue([{ id: 789 }] as any);

    const result = await caller.text.create({
      dutch_text: dutchText,
      // No title provided
      source: "paste",
    });

    // Verify createText was called with fallback title (first 50 chars + ...)
    expect(mockCreateText).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dutchText.substring(0, 50).trim() + "...",
        dutch_text: dutchText,
      })
    );

    expect(result.success).toBe(true);
    expect(result.text_id).toBe(789);
  });

  it("handles empty title string by generating new title", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const dutchText = "Nederland heeft een interessante geschiedenis met veel belangrijke gebeurtenissen.";

    // Mock gemini.generateTitle
    const mockGenerateTitle = vi.spyOn(gemini, "generateTitle");
    mockGenerateTitle.mockResolvedValue("Nederlandse Geschiedenis");

    // Mock db.createText
    const mockCreateText = vi.spyOn(db, "createText");
    mockCreateText.mockResolvedValue([{ id: 999 }] as any);

    const result = await caller.text.create({
      dutch_text: dutchText,
      title: "   ", // Empty/whitespace title
      source: "paste",
    });

    // Verify generateTitle was called (empty title treated as no title)
    expect(mockGenerateTitle).toHaveBeenCalledWith(dutchText);

    // Verify createText was called with generated title
    expect(mockCreateText).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nederlandse Geschiedenis",
        dutch_text: dutchText,
      })
    );

    expect(result.success).toBe(true);
  });
});
