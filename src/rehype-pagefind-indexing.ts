import type { Root } from "npm:@types/hast@3.0.4";
import type { Plugin, Transformer } from "npm:unified@11.0.5/";
import { visit } from "npm:unist-util-visit@5.0.0/";

type LimitSection = {
  condition: {
    tagName: string;
    //TODO: add support for more conditions
  };
};

type IgnoreIndividualElement = {
  condition: {
    tagName: string;
    //TODO: add support for more conditions
  };
  // The default is "index"
  ignore?: "index" | "all";
};

type AddHTMLAttrs = {
  condition: {
    tagName: string;
    //TODO: add support for more conditions
  };
  attrs: string[];
};

type Option = {
  /**
   * Attach `data-pagefind-body` attribute to limit indexing to a specific section
   * @see https://pagefind.app/docs/indexing/#limiting-what-sections-of-a-page-are-indexed
   */
  limitSections?: LimitSection[];

  /**
   * Attach `data-pagefind-ignore` attribute to ignore individual elements
   * @see https://pagefind.app/docs/indexing/#removing-individual-elements-from-the-index
   */
  ignoreIndividualElements?: IgnoreIndividualElement[];

  /**
   * Attach `data-pagefind-index-attrs` attribute to index HTML attributes
   * @see https://pagefind.app/docs/indexing/#adding-html-attributes-to-the-index
   */
  addHTMLAttrs?: AddHTMLAttrs[];
};

const rehypePagefindIndexing: Plugin<Option[], Root> = (
  option,
): Transformer<Root> => {
  // Limit indexing to a specific section by adding `data-pagefind-body`
  const attachDataPagefindBody = (
    tree: Root,
    limitSections: LimitSection[],
  ) => {
    for (const element of limitSections) {
      visit(tree, "element", (node) => {
        if (
          element.condition.tagName &&
          node.tagName !== element.condition.tagName
        ) {
          return;
        }

        node.properties["data-pagefind-body"] = "true";
      });
    }
  };

  // Ignore individual elements by adding `data-pagefind-ignore`
  const attachDataPagefindIgnore = (
    tree: Root,
    ignoreIndividualElements: IgnoreIndividualElement[],
  ) => {
    for (const element of ignoreIndividualElements) {
      visit(tree, "element", (node) => {
        if (
          element.condition.tagName &&
          node.tagName !== element.condition.tagName
        ) {
          return;
        }

        node.properties["data-pagefind-ignore"] = element.ignore || "index";
      });
    }
  };

  // Add HTML attributes to index by adding `data-pagefind-index-attrs`
  const attachDataPagefindIndexAttrs = (
    tree: Root,
    addHTMLAttrs: AddHTMLAttrs[],
  ) => {
    for (const element of addHTMLAttrs) {
      visit(tree, "element", (node) => {
        if (
          element.condition.tagName &&
          node.tagName !== element.condition.tagName
        ) {
          return;
        }

        if (element.attrs.length === 0) {
          return;
        }

        node.properties["data-pagefind-index-attrs"] = element.attrs.join(",");
      });
    }
  };

  const transformer: Transformer<Root> = (tree) => {
    if (option.limitSections) {
      attachDataPagefindBody(tree, option.limitSections);
    }

    if (option.ignoreIndividualElements) {
      attachDataPagefindIgnore(tree, option.ignoreIndividualElements);
    }

    if (option.addHTMLAttrs) {
      attachDataPagefindIndexAttrs(tree, option.addHTMLAttrs);
    }
  };

  return transformer;
};

export { rehypePagefindIndexing };
