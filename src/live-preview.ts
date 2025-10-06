import { RangeSet, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  PluginSpec,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import { LinearAPIService } from "./api";
import { LinearRenderer } from "./renderer";
import { IssueDisplayMode, LinearIssue } from "./types";
import { LINEAR_SHORTCODE_REGEX } from "./constants";

interface IMatchDecoratorRef {
  ref: MatchDecorator | null;
}

const isEditorInLivePreviewMode = (view: EditorView) =>
  view.state.field(editorLivePreviewField as unknown as StateField<boolean>);

const isCursorInsideTag = (view: EditorView, start: number, length: number) => {
  const cursor = view.state.selection.main.head;
  return cursor > start - 1 && cursor < start + length + 1;
};

const isSelectionContainsTag = (
  view: EditorView,
  start: number,
  length: number
) => {
  const selectionBegin = view.state.selection.main.from;
  const selectionEnd = view.state.selection.main.to;
  return selectionEnd > start - 1 && selectionBegin < start + length + 1;
};

class LinearIssueWidget extends WidgetType {
  private _issueKey: string;
  private _displayMode: IssueDisplayMode;
  private _htmlContainer: HTMLElement;
  private _apiService: LinearAPIService;
  private _renderer: LinearRenderer;
  private _destroyed: boolean = false;

  constructor(
    key: string,
    apiService: LinearAPIService,
    renderer: LinearRenderer,
    displayMode: IssueDisplayMode
  ) {
    super();
    this._issueKey = key;
    this._apiService = apiService;
    this._renderer = renderer;
    this._displayMode = displayMode;
    this._htmlContainer = document.createElement("span");
    this._htmlContainer.className = "linian-inline-issue linian-container";
    this.buildTag();
  }

  buildTag() {
    // Check if destroyed to prevent memory leaks
    if (this._destroyed) return;

    // Show loading initially
    const loadingElement = this._renderer.createLoadingElement(
      this._issueKey,
      this._displayMode
    );
    this._htmlContainer.replaceChildren(loadingElement);

    // Fetch issue data with timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API timeout")), 10000)
    );

    Promise.race([this._apiService.getIssue(this._issueKey), timeoutPromise])
      .then((result) => {
        if (this._destroyed) return; // Don't update if destroyed

        const issue = result as LinearIssue | null;
        if (issue) {
          const issueElement = this._renderer.createIssueElement(
            issue,
            this._displayMode
          );
          this._htmlContainer.replaceChildren(issueElement);
        } else {
          const errorElement = this._renderer.createErrorElement(
            this._issueKey,
            this._displayMode
          );
          this._htmlContainer.replaceChildren(errorElement);
        }
      })
      .catch((error) => {
        if (this._destroyed) return; // Don't update if destroyed

        console.error("Error fetching Linear issue:", error);
        const errorElement = this._renderer.createErrorElement(
          this._issueKey,
          this._displayMode
        );
        this._htmlContainer.replaceChildren(errorElement);
      });
  }

  toDOM(view: EditorView): HTMLElement {
    return this._htmlContainer;
  }

  destroy() {
    this._destroyed = true;
    // Clean up DOM references
    this._htmlContainer.replaceChildren();
  }
}

// Global variable with the match decorator
let linearMatchDecorator: IMatchDecoratorRef = { ref: null };

function buildMatchDecorator(
  apiService: LinearAPIService,
  renderer: LinearRenderer
) {
  linearMatchDecorator.ref = new MatchDecorator({
    regexp: LINEAR_SHORTCODE_REGEX,
    decoration: (match: RegExpExecArray, view: EditorView, pos: number) => {
      const displayMode: IssueDisplayMode = match[1]
        ? "expanded"
        : "compact";
      const key = match[2];
      const tagLength = match[0].length;

      // Don't replace if cursor is inside the tag or selection contains it
      if (
        !isEditorInLivePreviewMode(view) ||
        isCursorInsideTag(view, pos, tagLength) ||
        isSelectionContainsTag(view, pos, tagLength)
      ) {
        return Decoration.mark({
          tagName: "span",
          class: "linian-shortcode-highlight",
        });
      } else {
        return Decoration.replace({
          widget: new LinearIssueWidget(
            key,
            apiService,
            renderer,
            displayMode
          ),
        });
      }
    },
  });
}

function buildViewPluginClass(matchDecorator: IMatchDecoratorRef) {
  class ViewPluginClass implements PluginValue {
    decorators: DecorationSet;

    constructor(view: EditorView) {
      this.decorators = matchDecorator.ref
        ? matchDecorator.ref.createDeco(view)
        : RangeSet.empty;
    }

    update(update: ViewUpdate): void {
      const editorModeChanged =
        update.startState.field(
          editorLivePreviewField as unknown as StateField<boolean>
        ) !==
        update.state.field(
          editorLivePreviewField as unknown as StateField<boolean>
        );

      if (
        update.docChanged ||
        update.startState.selection.main !== update.state.selection.main ||
        editorModeChanged
      ) {
        this.decorators = matchDecorator.ref
          ? matchDecorator.ref.createDeco(update.view)
          : RangeSet.empty;
      }
    }

    destroy(): void {
      this.decorators = RangeSet.empty;
    }
  }

  const ViewPluginSpec: PluginSpec<ViewPluginClass> = {
    decorations: (viewPlugin) => viewPlugin.decorators,
  };

  return {
    class: ViewPluginClass,
    spec: ViewPluginSpec,
  };
}

export class LinearViewPluginManager {
  private _viewPlugin: ViewPlugin<PluginValue>;
  private _apiService: LinearAPIService | null = null;
  private _renderer: LinearRenderer | null = null;

  constructor() {
    this.update();
  }

  setServices(apiService: LinearAPIService, renderer: LinearRenderer) {
    this._apiService = apiService;
    this._renderer = renderer;
    this.update();
  }

  update() {
    if (this._apiService && this._renderer) {
      buildMatchDecorator(this._apiService, this._renderer);
      const viewPluginClass = buildViewPluginClass(linearMatchDecorator);
      this._viewPlugin = ViewPlugin.fromClass(
        viewPluginClass.class,
        viewPluginClass.spec
      );
    }
  }

  getViewPlugin(): ViewPlugin<any> | null {
    return this._viewPlugin || null;
  }
}
