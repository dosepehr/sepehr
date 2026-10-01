import { z } from 'zod';

const isServer = typeof window === 'undefined';

// Vitest's Storybook test project loads next.config.ts too (via
// @storybook/nextjs-vite), but that process doesn't set up .env.local the
// way the Next.js CLI does — skip validation there instead of failing
// `npm run test` on a missing var that plain unit tests never touch.
const isVitest = Boolean(process.env.VITEST);

const serverSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    BACKEND_URL: z.url(),
});

const clientSchema = z.object({
    NEXT_PUBLIC_APP_BASE_URL: z.url(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function parseEnv<Schema extends z.ZodType>(
    schema: Schema,
    values: Record<string, string | undefined>,
    target: 'client' | 'server',
): z.infer<Schema> {
    // Under Vitest, pass values through unvalidated rather than throwing on
    // vars the Next CLI would normally load from .env.local (see isVitest).
    if (isVitest) return values as z.infer<Schema>;

    const result = schema.safeParse(values);
    if (!result.success) {
        console.error(
            `❌ Invalid ${target} environment variables:`,
            z.flattenError(result.error).fieldErrors,
        );
        throw new Error(
            `Invalid ${target} environment variables, see console output above`,
        );
    }
    return result.data;
}

// Next.js statically inlines `process.env.NEXT_PUBLIC_*` references at build
// time, so each var must be accessed by its literal name (no dynamic keys).
const clientEnv = parseEnv(
    clientSchema,
    { NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL },
    'client',
);

const serverEnv = isServer
    ? parseEnv(
          serverSchema,
          {
              NODE_ENV: process.env.NODE_ENV,
              BACKEND_URL: process.env.BACKEND_URL,
          },
          'server',
      )
    : undefined;

const mergedEnv = { ...clientEnv, ...serverEnv } as ClientEnv & ServerEnv;

/**
 * Type-safe, validated environment variables. Reading a server-only var from
 * client code throws immediately instead of silently returning `undefined`.
 */
export const env = new Proxy(mergedEnv, {
    get(target, prop: string) {
        if (!isServer && !(prop in clientEnv)) {
            throw new Error(
                `❌ Attempted to access server-side environment variable "${prop}" on the client`,
            );
        }
        return target[prop as keyof typeof target];
    },
}) as ClientEnv & ServerEnv;
