# dnn-monaco-editor



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute              | Description                                                                                                                                         | Type                  | Default     |
| ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `loadFontFromLocal` | `load-font-from-local` | If set to true, then it is the responsibility of the consumer to have codicon.ttf in their distribution (e.g., ./assets/monaco-editor/codicon.ttf). | `boolean`             | `false`     |
| `options`           | --                     | Sets the monaco editor options, see monaco options.                                                                                                 | `MonacoEditorOptions` | `undefined` |


## Events

| Event           | Description                         | Type                |
| --------------- | ----------------------------------- | ------------------- |
| `editorDidLoad` | Event to indicate editor has loaded | `CustomEvent<void>` |


## Methods

### `getValue() => Promise<string>`

Get value of the current model attached to this editor.

#### Returns

Type: `Promise<string>`



### `setFocus() => Promise<void>`

Set focus to editor

#### Returns

Type: `Promise<void>`



### `setValue(newValue: string) => Promise<void>`

Sets a new editor value.

#### Returns

Type: `Promise<void>`



### `updateLanguage(languageId: string) => Promise<void>`

Update code language editor

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                     | Description                           |
| ------------------------ | ------------------------------------- |
| `--monaco-editor-height` | height of the editor, default is 50vh |
| `--monaco-editor-width`  | width of the editor, default is 100%  |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*