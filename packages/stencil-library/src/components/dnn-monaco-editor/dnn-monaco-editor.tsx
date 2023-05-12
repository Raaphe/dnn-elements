import {Component, Event, EventEmitter, h, Host, Prop, Watch } from '@stencil/core';
import * as monaco from "@timkendrick/monaco-editor";

@Component({
  tag: 'dnn-monaco-editor',
  styleUrl: 'dnn-monaco-editor.scss',
  scoped: true,
})
export class DnnMonacoEditor {
  private editorContainer: HTMLDivElement;
  private editor: monaco.editor.IStandaloneCodeEditor;

  /** Defines the language for the editor. */
  @Prop() language: "plaintext" | "bat" | "coffeescript" | "c" | "cpp" | "csharp" | "dockerfile" | "fsharp" | "go" | "handlebars" | "html" | "ini" | "pug" | "java" | "lua" | "markdown" | "msdax" | "objective-c" | "postiats" | "php" | "powershell" | "python" | "r" | "razor" | "ruby" | "swift" | "sql" | "vb" | "xml" | "less" | "scss" | "css" | "yaml" | "sol" | "sb" | "json" | "typescript" | "javascript" = "html";
  @Watch('language')
  languageChanged(newValue: string, oldValue: string) {
    if (newValue != oldValue) {
      monaco.editor.setModelLanguage(this.editor.getModel(), newValue);
    }
  }

  /** Sets the code contained in the editor */
  @Prop({mutable: true}) value: string;
  @Watch('value')
  valueChanged(newValue: string, oldValue: string) {
    if (newValue != oldValue) {
      this.editor.setValue(newValue);
    }
  }

  /** Emits the new value of the content when it is changed. */
  @Event() contentChanged: EventEmitter<string>;
  
  componentDidLoad(){
    this.editor = monaco.editor.create(this.editorContainer, {
      value: this.value,
      language: this.language,
      theme: "vs-dark",
      automaticLayout: true,
    });
    this.editor.onDidChangeModelContent(() => {
      this.value = this.editor.getValue();
      this.contentChanged.emit(this.value);
    });
  }

  render() {
    return (
      <Host>
        <div
          class="editor-container"
          ref={el => this.editorContainer = el}
        />
      </Host>
    );
  }
}