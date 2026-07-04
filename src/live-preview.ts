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
import { IssueController } from "./issue-controller";
import { IssueDisplayMode } from "./types";
import { LINEAR_SHORTCODE_REGEX } from "./constants";

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
  private _container: HTMLElement;

  constructor(
    private key: string,
    private controller: IssueController,
    private displayMode: IssueDisplayMode
  ) {
    super();
    this._container = document.createElement("span");
    this._container.className = "linian-inline-issue linian-container";
    // Cache-first render: paints instantly from disk, revalidates in the
    // background per the controller's SWR policy.
    this.controller.render(this._container, this.key, this.displayMode);
  }

  eq(other: LinearIssueWidget): boolean {
    return other.key === this.key && other.displayMode === this.displayMode;
  }

  toDOM(): HTMLElement {
    return this._container;
  }

  destroy(): void {
    this._container.replaceChildren();
  }
}

function buildMatchDecorator(controller: IssueController): MatchDecorator {
  return new MatchDecorator({
    regexp: LINEAR_SHORTCODE_REGEX,
    decoration: (match: RegExpExecArray, view: EditorView, pos: number) => {
      const displayMode: IssueDisplayMode = match[1] ? "expanded" : "compact";
      const key = match[2];
      const tagLength = match[0].length;

      if (
        !isEditorInLivePreviewMode(view) ||
        isCursorInsideTag(view, pos, tagLength) ||
        isSelectionContainsTag(view, pos, tagLength)
      ) {
        return Decoration.mark({
          tagName: "span",
          class: "linian-shortcode-highlight",
        });
      }
      return Decoration.replace({
        widget: new LinearIssueWidget(key, controller, displayMode),
      });
    },
  });
}

function buildViewPlugin(decorator: MatchDecorator): ViewPlugin<PluginValue> {
  class ViewPluginClass implements PluginValue {
    decorators: DecorationSet;

    constructor(view: EditorView) {
      this.decorators = decorator.createDeco(view);
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
        this.decorators = decorator.createDeco(update.view);
      }
    }

    destroy(): void {
      this.decorators = RangeSet.empty;
    }
  }

  const spec: PluginSpec<ViewPluginClass> = {
    decorations: (viewPlugin) => viewPlugin.decorators,
  };
  return ViewPlugin.fromClass(ViewPluginClass, spec);
}

export class LinearViewPluginManager {
  private _viewPlugin: ViewPlugin<PluginValue> | null = null;

  setController(controller: IssueController) {
    this._viewPlugin = buildViewPlugin(buildMatchDecorator(controller));
  }

  getViewPlugin(): ViewPlugin<PluginValue> | null {
    return this._viewPlugin;
  }
}
