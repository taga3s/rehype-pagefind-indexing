import { describe, it } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { unified } from "npm:unified@11.0.5";
import remarkParse from "npm:remark-parse@11.0.0";
import remarkRehype from "npm:remark-rehype@11.1.2";
import rehypeStringify from "npm:rehype-stringify@10.0.1";
import {
  type Option as PagefindIndexingOption,
  rehypePagefindIndexing,
} from "./rehype-pagefind-indexing.ts";
import type { Plugin } from "npm:unified@11.0.5";
import type { Root } from "npm:@types/hast@3.0.4";
import type { Transformer } from "npm:unified@11.0.5";
import { visit } from "npm:unist-util-visit@5.0.0";

const fixture = async (option: PagefindIndexingOption) => {
  const _rehypeImgAttachId: Plugin<[], Root> = (): Transformer<Root> => {
    return (tree) => {
      visit(tree, "element", (node) => {
        if (node.tagName === "img") {
          node.properties.id = "test-id";
        }
      });
    };
  };

  const _rehypeImgAttachClass: Plugin<[], Root> = (): Transformer<Root> => {
    return (tree) => {
      visit(tree, "element", (node) => {
        if (node.tagName === "img") {
          node.properties.class = ["test-class1", "test-class2"];
        }
      });
    };
  };

  const process = async (
    text: string,
    pagefindIndexingOption: PagefindIndexingOption,
  ): Promise<string> => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(_rehypeImgAttachId)
      .use(_rehypeImgAttachClass)
      .use(rehypePagefindIndexing, pagefindIndexingOption)
      .use(rehypeStringify)
      .process(text);

    return result.toString();
  };

  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile("./src/fixture.md");
  const text = decoder.decode(data);

  const result = await process(text, option);

  return {
    result,
  };
};

describe("rehype-pagefind-indexing: condition check", () => {
  it("should attach attrs based on a tagName", async (t) => {
    const { result } = await fixture({
      ignoreIndividualElements: [
        {
          condition: {
            tagName: "code",
          },
          ignore: "all",
        },
      ],
    });
    await assertSnapshot(t, result);
  });

  it("should attach attrs based on a tagName and an id", async (t) => {
    const { result } = await fixture({
      ignoreIndividualElements: [
        {
          condition: {
            tagName: "img",
            id: "test-id",
          },
          ignore: "all",
        },
      ],
    });
    await assertSnapshot(t, result);
  });

  it("should attach attrs based on a tagName and multiple classes (matchAll)", async (t) => {
    const { result } = await fixture({
      ignoreIndividualElements: [
        {
          condition: {
            tagName: "img",
            class: {
              matchAll: ["test-class1", "test-class2"],
            },
          },
          ignore: "all",
        },
      ],
    });
    await assertSnapshot(t, result);
  });

  it("should NOT attach attrs based on a tagName and multiple classes (matchAll)", async (t) => {
    const { result } = await fixture({
      ignoreIndividualElements: [
        {
          condition: {
            tagName: "img",
            class: {
              matchAll: ["test-class1", "test-class3"],
            },
          },
          ignore: "all",
        },
      ],
    });
    await assertSnapshot(t, result);
  });

  it("should attach attrs based on a tagName and a class (matchAny)", async (t) => {
    const { result } = await fixture({
      ignoreIndividualElements: [
        {
          condition: {
            tagName: "img",
            class: {
              matchAny: ["test-class1"],
            },
          },
          ignore: "all",
        },
      ],
    });
    await assertSnapshot(t, result);
  });

  it("should NOT attach attrs based on a tagName and a class (matchAny)", async (t) => {
    const { result } = await fixture({
      ignoreIndividualElements: [
        {
          condition: {
            tagName: "img",
            class: {
              matchAny: ["test-class3"],
            },
          },
          ignore: "all",
        },
      ],
    });
    await assertSnapshot(t, result);
  });
});

it("should attach `data-pagefind-ignore` to the element", async (t) => {
  const { result } = await fixture({
    ignoreIndividualElements: [
      {
        condition: {
          tagName: "code",
        },
        ignore: "all",
      },
    ],
  });
  await assertSnapshot(t, result);
});

it("should attach `data-pagefind-index-attrs` to the element", async (t) => {
  const { result } = await fixture({
    addHTMLAttrs: [
      {
        condition: {
          tagName: "img",
          id: "test-id",
        },
        attrs: ["title", "alt"],
      },
    ],
  });
  await assertSnapshot(t, result);
});

it("should attach `data-pagefind-body` to the element", async (t) => {
  const { result } = await fixture({
    limitSections: [
      {
        condition: {
          tagName: "p",
        },
      },
    ],
  });
  await assertSnapshot(t, result);
});
