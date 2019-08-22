import PropTypes from "prop-types";
/* eslint-disable */

import React from "react";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  KeyBindingUtil,
  Modifier,
  AtomicBlockUtils
} from "draft-js";

import firebase from "firebase";

import "draft-js/dist/Draft.css";
import "hint.css/hint.min.css";

import "../medium-draft/src/index.scss";
import "../medium-draft/src/components/addbutton.scss";
import "../medium-draft/src/components/toolbar.scss";
import "../medium-draft/src/components/blocks/text.scss";
import "../medium-draft/src/components/blocks/atomic.scss";
import "../medium-draft/src/components/blocks/blockquotecaption.scss";
import "../medium-draft/src/components/blocks/caption.scss";
import "../medium-draft/src/components/blocks/todo.scss";
import "../medium-draft/src/components/blocks/image.scss";

import {
  Editor,
  StringToTypeMap,
  Block,
  keyBindingFn,
  createEditorState,
  addNewBlockAt,
  beforeInput,
  getCurrentBlock,
  ImageSideButton,
  rendererFn,
  HANDLED,
  NOT_HANDLED
} from "../medium-draft/src/index.js";

import {
  setRenderOptions,
  blockToHTML,
  entityToHTML,
  styleToHTML
} from "../medium-draft/src/exporter.js";

const newTypeMap = StringToTypeMap;
newTypeMap["2."] = Block.OL;

const { hasCommandModifier } = KeyBindingUtil;

/*
A demo for example editor. (Feature not built into medium-draft as too specific.)
Convert quotes to curly quotes.
*/
const DQUOTE_START = "“";
const DQUOTE_END = "”";
const SQUOTE_START = "‘";
const SQUOTE_END = "’";

const newBlockToHTML = block => {
  const blockType = block.type;
  if (block.type === Block.ATOMIC) {
    if (block.text === "E") {
      return {
        start: '<figure class="md-block-atomic md-block-atomic-embed">',
        end: "</figure>"
      };
    } else if (block.text === "-") {
      return (
        <div className="md-block-atomic md-block-atomic-break">
          <hr />
        </div>
      );
    }
  }
  return blockToHTML(block);
};

const newEntityToHTML = (entity, originalText) => {
  if (entity.type === "embed") {
    return (
      <div>
        <a
          className="embedly-card"
          href={entity.data.url}
          data-card-controls="0"
          data-card-theme="dark"
        >
          Embedded ― {entity.data.url}
        </a>
      </div>
    );
  }
  return entityToHTML(entity, originalText);
};

const handleBeforeInput = (editorState, str, onChange) => {
  if (str === '"' || str === "'") {
    const currentBlock = getCurrentBlock(editorState);
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const text = currentBlock.getText();
    const len = text.length;
    if (selectionState.getAnchorOffset() === 0) {
      onChange(
        EditorState.push(
          editorState,
          Modifier.insertText(
            contentState,
            selectionState,
            str === '"' ? DQUOTE_START : SQUOTE_START
          ),
          "transpose-characters"
        )
      );
      return HANDLED;
    } else if (len > 0) {
      const lastChar = text[len - 1];
      if (lastChar !== " ") {
        onChange(
          EditorState.push(
            editorState,
            Modifier.insertText(
              contentState,
              selectionState,
              str === '"' ? DQUOTE_END : SQUOTE_END
            ),
            "transpose-characters"
          )
        );
      } else {
        onChange(
          EditorState.push(
            editorState,
            Modifier.insertText(
              contentState,
              selectionState,
              str === '"' ? DQUOTE_START : SQUOTE_START
            ),
            "transpose-characters"
          )
        );
      }
      return HANDLED;
    }
  }
  return beforeInput(editorState, str, onChange, newTypeMap);
};

class SeparatorSideButton extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    let editorState = this.props.getEditorState();
    const content = editorState.getCurrentContent();
    const contentWithEntity = content.createEntity(
      "separator",
      "IMMUTABLE",
      {}
    );
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    editorState = EditorState.push(
      editorState,
      contentWithEntity,
      "create-entity"
    );
    this.props.setEditorState(
      AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, "-")
    );
    this.props.close();
  }

  render() {
    const ImageStying = {
      height: "20px",
      width: "100%"
    };
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        title="Add a separator"
        onClick={this.onClick}
      >
        <img src={require("./Images/separator.png")} style={ImageStying} />
      </button>
    );
  }
}

class EmbedSideButton extends React.Component {
  static propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    close: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.addEmbedURL = this.addEmbedURL.bind(this);
  }

  onClick() {
    const url = window.prompt(
      "Enter a URL",
      "https://www.youtube.com/watch?v=PMNFaAUs2mo"
    );
    this.props.close();
    if (!url) {
      return;
    }
    this.addEmbedURL(url);
  }

  addEmbedURL(url) {
    let editorState = this.props.getEditorState();
    const content = editorState.getCurrentContent();
    const contentWithEntity = content.createEntity("embed", "IMMUTABLE", {
      url
    });
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    editorState = EditorState.push(
      editorState,
      contentWithEntity,
      "create-entity"
    );
    this.props.setEditorState(
      AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, "E")
    );
  }

  render() {
    const ImageStying = {
      height: "19px",
      width: "100%"
    };
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        title="Add an Embed"
        onClick={this.onClick}
      >
        <img
          id="pictureSideButtons"
          src={require("./Images/embed.png")}
          style={ImageStying}
        />
      </button>
    );
  }
}

class AtomicEmbedComponent extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showIframe: false
    };

    this.enablePreview = this.enablePreview.bind(this);
  }

  componentDidMount() {
    this.renderEmbedly();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.showIframe !== this.state.showIframe &&
      this.state.showIframe === true
    ) {
      this.renderEmbedly();
    }
  }

  getScript() {
    const script = document.createElement("script");
    script.async = 1;
    script.src = "//cdn.embedly.com/widgets/platform.js";
    script.onload = () => {
      window.embedly();
    };
    document.body.appendChild(script);
  }

  renderEmbedly() {
    if (window.embedly) {
      window.embedly();
    } else {
      this.getScript();
    }
  }

  enablePreview() {
    this.setState({
      showIframe: true
    });
  }

  render() {
    const { url } = this.props.data;
    const innerHTML = `<div><a class="embedly-card" href="${url}" data-card-controls="0" data-card-theme="dark">Embedded ― ${url}</a></div>`;
    return (
      <div className="md-block-atomic-embed">
        <div dangerouslySetInnerHTML={{ __html: innerHTML }} />
      </div>
    );
  }
}

const AtomicSeparatorComponent = props => <hr />;

const AtomicBlock = props => {
  const { blockProps, block } = props;
  const content = blockProps.getEditorState().getCurrentContent();
  const entity = content.getEntity(block.getEntityAt(0));
  const data = entity.getData();
  const type = entity.getType();
  if (blockProps.components[type]) {
    const AtComponent = blockProps.components[type];
    return (
      <div
        className={`md-block-atomic-wrapper md-block-atomic-wrapper-${type}`}
      >
        <AtComponent data={data} />
      </div>
    );
  }
  return (
    <p>
      Block of type <b>{type}</b> is not supported.
    </p>
  );
};

const RandomPlaceholders = [
  "Now tell your story...",
  "This is where it all begins...",
  "Feed me with content...",
  "Start with a few lines...",
  "Words matter..."
];

export default class MediumEditorCustom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: createEditorState(),
      editorEnabled: this.props.isEditable,
      placeholder: RandomPlaceholders[Math.floor(Math.random() * 5)]
    };

    this.boardId = localStorage.getItem("boardId");
    this.userId = localStorage.getItem("userId");
    this.contents = "";
    this.noteId = this.props.noteId;
    this.noteContentRef = firebase
      .database()
      .ref("boards/" + this.boardId + "/notes/" + this.noteId + "/");

    this.onChange = editorState => {
      if (this.state.editorEnabled) {
        this.setState({ editorState });
      }
    };

    this.sideButtons = [
      {
        title: "Image",
        component: ImageSideButton
      },
      {
        title: "Embed",
        component: EmbedSideButton
      },
      {
        title: "Separator",
        component: SeparatorSideButton
      }
    ];

    this.exporter = setRenderOptions({
      styleToHTML,
      blockToHTML: newBlockToHTML,
      entityToHTML: newEntityToHTML
    });

    this.getEditorState = () => this.state.editorState;

    this.logData = this.logData.bind(this);
    this.renderHTML = this.renderHTML.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.loadSavedData = this.loadSavedData.bind(this);
    this.keyBinding = this.keyBinding.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleDroppedFiles = this.handleDroppedFiles.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isEditable) {
      this.setState({ editorEnabled: true });
    } else if (!nextProps.isEditable) {
      this.setState({ editorEnabled: false });
    }
  }

  rendererFn(setEditorState, getEditorState) {
    const atomicRenderers = {
      embed: AtomicEmbedComponent,
      separator: AtomicSeparatorComponent
    };
    const rFnOld = rendererFn(setEditorState, getEditorState);
    const rFnNew = contentBlock => {
      const type = contentBlock.getType();
      switch (type) {
        case Block.ATOMIC:
          return {
            component: AtomicBlock,
            editable: false,
            props: {
              components: atomicRenderers,
              getEditorState
            }
          };
        default:
          return rFnOld(contentBlock);
      }
    };
    return rFnNew;
  }

  keyBinding(e) {
    if (hasCommandModifier(e)) {
      if (e.which === 83) {
        /* Key S */
        return "editor-save";
      }
      // else if (e.which === 74 /* Key J */) {
      //  return 'do-nothing';
      //}
    }
    if (e.altKey === true) {
      if (e.shiftKey === true) {
        switch (e.which) {
          /* Alt + Shift + L */
          case 76:
            return "load-saved-data";
          /* Key E */
          // case 69: return 'toggle-edit-mode';
        }
      }
      if (e.which === 72 /* Key H */) {
        return "toggleinline:HIGHLIGHT";
      }
    }
    return keyBindingFn(e);
  }

  handleKeyCommand(command) {
    if (command === "editor-save") {
      window.localStorage["editor"] = JSON.stringify(
        convertToRaw(this.state.editorState.getCurrentContent())
      );
      window.ga("send", "event", "draftjs", command);
      return true;
    } else if (command === "load-saved-data") {
      this.loadSavedData();
      return true;
    } else if (command === "toggle-edit-mode") {
      this.toggleEdit();
    }
    return false;
  }

  fetchData() {
    window.ga("send", "event", "draftjs", "load-data", "ajax");

    this.noteContentRef.child("contents").once("value", snapshot => {
      if (snapshot.val() !== null && snapshot.val() !== "") {
        this.setState({
          editorState: EditorState.createWithContent(
            convertFromRaw(JSON.parse(snapshot.val()))
          )
        });
      } else if (snapshot.val() === "") {
        console.log("hye");
        this.setState({ editorState: EditorState.createEmpty() });
      }
    });
  }

  logData(e) {
    const currentContent = this.state.editorState.getCurrentContent();
    const es = convertToRaw(currentContent);
    this.noteContentRef.update({
      contents: JSON.stringify(es)
    });
    //LAST EDIT
    firebase
      .database()
      .ref("/users/" + this.userId + "/lastEdit/")
      .once("value", snapshot => {
        let hasValue = false;
        snapshot.forEach(child => {
          if (child.val() === this.boardId && !hasValue) {
            firebase
              .database()
              .ref("/users/" + this.userId + "/lastEdit/" + child.key)
              .remove();
            hasValue = true;
            firebase
              .database()
              .ref("/users/" + this.userId + "/lastEdit/")
              .push(this.boardId);
          }
        });
        if (!hasValue)
          firebase
            .database()
            .ref("/users/" + this.userId + "/lastEdit/")
            .push(this.boardId);
      });

    window.ga("send", "event", "draftjs", "log-data");
  }

  renderHTML(e) {
    const currentContent = this.state.editorState.getCurrentContent();
    const HTML = this.exporter(currentContent);
  }

  loadSavedData() {
    const data = window.localStorage.getItem("editor");
    if (data === null) {
      return;
    }
    try {
      const blockData = JSON.parse(data);
      this.onChange(
        EditorState.push(this.state.editorState, convertFromRaw(blockData)),
        this._editor.focus
      );
    } catch (e) {
      console.log(e);
    }
    window.ga("send", "event", "draftjs", "load-data", "localstorage");
  }

  toggleEdit(e) {
    this.setState(
      {
        editorEnabled: !this.state.editorEnabled
      },
      () => {
        window.ga(
          "send",
          "event",
          "draftjs",
          "toggle-edit",
          this.state.editorEnabled + ""
        );
      }
    );
  }

  handleDroppedFiles(selection, files) {
    window.ga(
      "send",
      "event",
      "draftjs",
      "filesdropped",
      files.length + " files"
    );
    const file = files[0];
    if (file.type.indexOf("image/") === 0) {
      // eslint-disable-next-line no-undef
      const src = URL.createObjectURL(file);
      this.onChange(
        addNewBlockAt(
          this.state.editorState,
          selection.getAnchorKey(),
          Block.IMAGE,
          {
            src
          }
        )
      );
      return HANDLED;
    }
    return NOT_HANDLED;
  }

  handleReturn(e) {
    // const currentBlock = getCurrentBlock(this.state.editorState);
    // var text = currentBlock.getText();
    return NOT_HANDLED;
  }

  render() {
    const { editorState, editorEnabled } = this.state;

    return (
      <div>
        <Editor
          ref={e => {
            this._editor = e;
          }}
          editorState={editorState}
          onChange={this.onChange}
          onBlur={this.logData}
          editorEnabled={editorEnabled}
          handleDroppedFiles={this.handleDroppedFiles}
          handleKeyCommand={this.handleKeyCommand}
          placeholder={this.state.placeholder}
          keyBindingFn={this.keyBinding}
          beforeInput={handleBeforeInput}
          handleReturn={this.handleReturn}
          sideButtons={this.sideButtons}
          rendererFn={this.rendererFn}
          spellCheck={false}
        />
      </div>
    );
  }
}

window.ga = function() {
  //console.log(arguments);
};
