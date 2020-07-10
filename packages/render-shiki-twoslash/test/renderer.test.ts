import { canHighlightLang, renderCodeToHTML, runTwoSlash, setupHighLighter } from "../src/index"
import { join } from "path"

describe("langs", () => {
  it("gives reasonable results", () => {
    expect(canHighlightLang("js")).toBeTruthy()
    expect(canHighlightLang("ts")).toBeTruthy()
    expect(canHighlightLang("tsx")).toBeTruthy()
    expect(canHighlightLang("html")).toBeTruthy()

    expect(canHighlightLang("adasdasd")).toBeFalsy()
  })
})

describe("with a simple example", () => {
  it("shows the right LSP results", async () => {
    await setupHighLighter({ theme: "nord" })
    const code = `
// Hello
const a = "123"
const b = "345"
    `
    const twoslash = runTwoSlash(code, "ts", {})
    const html = renderCodeToHTML(code, "ts", twoslash)

    expect(html).toContain(`data-lsp`)
    expect(html).toContain(`<data-lsp lsp='const a:`)
    expect(html).toContain(`<data-lsp lsp='const b:`)
    expect(html.split("<data-lsp").length).toEqual(twoslash.staticQuickInfos.length + 1)
  })
})

describe("with a more complex example", () => {
  const file = `
// @errors: 2345
function longest<T extends { length: number }>(a: T, b: T) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString is of type 'string'
const longerString = longest("alice", "bob");
// Error! Numbers don't have a 'length' property
const notOK = longest(10, 100);

const hello = longest("alice", "bob");
console.log(hello);
`

  it("shows the right LSP results", async () => {
    const twoslash = runTwoSlash(file, "ts", {})
    const html = renderCodeToHTML(file, "ts", twoslash)

    expect(html).toContain(`data-lsp`)
    expect(html).toContain(`<data-lsp lsp='function longest`)

    // Error message
    expect(html).toContain(`span class="error"`)
    expect(html).toContain(`span class="error-behind"`)
    // The error code
    expect(html).toContain(`<span class="code">2345</span>`)
  })

  it("shows the right LSP results when a theme doesnt have unique tokens for identifiers", async () => {
    const twoslash = runTwoSlash(file, "ts", {})
    const html = renderCodeToHTML(file, "ts", twoslash)

    expect(html).toContain(`<data-lsp lsp='function longest`)

    // Error message
    expect(html).toContain(`span class="error"`)
    expect(html).toContain(`span class="error-behind"`)
    // The error code
    expect(html).toContain(`<span class="code">2345</span>`)
    expect(html.split("<data-lsp").length).toEqual(twoslash.staticQuickInfos.length + 1)
  })
})

describe("raw LSP details example", () => {
  const file = `
// @errors: 2345
function longest<T extends { length: number }>(a: T, b: T) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString is of type 'string'
const longerString = longest("alice", "bob");
// Error! Numbers don't have a 'length' property
const notOK = longest(10, 100);

const hello = longest("alice", "bob");
console.log(hello);
`

  it("shows the right LSP results when a theme doesnt have unique tokens for identifiers", async () => {
    await setupHighLighter({ theme: "light_vs" })
    const twoslash = runTwoSlash(file, "ts", {})
    const html = renderCodeToHTML(file, "ts", twoslash)

    expect(html).toContain(`data-lsp`)
    expect(html).toContain(`<data-lsp lsp='function longest`)

    expect(html.split("<data-lsp").length).toEqual(twoslash.staticQuickInfos.length + 1)
  })

  it("shows the right LSP results with the typescript site theme", async () => {
    await setupHighLighter({
      theme: join(__dirname, "..", "..", "typescriptlang-org", "lib", "themes", "typescript-beta-light.json") as any,
    })

    const twoslash = runTwoSlash(file, "ts", {})
    const html = renderCodeToHTML(file, "ts", twoslash)

    expect(html).toContain(`data-lsp`)
    expect(html).toContain(`<data-lsp lsp='function longest`)
    expect(html.split("<data-lsp").length).toEqual(twoslash.staticQuickInfos.length + 1)
  })
})
