import * as vscode from 'vscode'
import Commands from '@/state/Commands'

/**key:'file-line' */
const idMap = new Map<string, number>()

export class NoteComment implements vscode.Comment {
  id: string
  label: string | undefined
  savedBody: string | vscode.MarkdownString // for the Cancel button
  constructor(
    public body: string | vscode.MarkdownString,
    public mode: vscode.CommentMode,
    public author: vscode.CommentAuthorInformation,
    public parent?: vscode.CommentThread,
    public contextValue?: string,
    public file: string = '',
    public line: number = 0,
  ) {
    const key = `${file}-${line}`
    const id = idMap.get(key)
    if (id) this.id = `${key}-${id}`
    else this.id = `${key}-0`
    idMap.set(key, id ? id + 1 : 1)
    this.savedBody = this.body
  }
}

export const commentController = vscode.comments.createCommentController(
  'zerozawa.noveler.comment',
  'Noveler Comment',
)

// A `CommentingRangeProvider` controls where gutter decorations that allow adding comments are shown
commentController.commentingRangeProvider = {
  provideCommentingRanges: (document) => {
    const lineCount = document.lineCount
    return [new vscode.Range(0, 0, lineCount - 1, 0)]
  },
}

const replyNote = (reply: vscode.CommentReply) => {
  const thread = reply.thread
  const newComment = new NoteComment(
    reply.text,
    vscode.CommentMode.Preview,
    { name: 'vscode' },
    thread,
    thread.comments.length ? 'canDelete' : undefined,
  )
  if (thread.contextValue === 'draft') {
    newComment.label = 'pending'
  }
  thread.comments = [...thread.comments, newComment]
}

export const commands = {
  createNote: vscode.commands.registerCommand(
    Commands.CommentCreateNote,
    (reply: vscode.CommentReply) => {
      replyNote(reply)
    },
  ),
  replyNote: vscode.commands.registerCommand(
    Commands.CommentReplyNote,
    (reply: vscode.CommentReply) => {
      replyNote(reply)
    },
  ),
  startDraft: vscode.commands.registerCommand(
    Commands.CommentStartDraft,
    (reply: vscode.CommentReply) => {
      const thread = reply.thread
      thread.contextValue = 'draft'
      const newComment = new NoteComment(
        reply.text,
        vscode.CommentMode.Preview,
        { name: 'vscode' },
        thread,
      )
      newComment.label = 'pending'
      thread.comments = [...thread.comments, newComment]
    },
  ),
  finishDraft: vscode.commands.registerCommand(
    Commands.CommentFinishDraft,
    (reply: vscode.CommentReply) => {
      const thread = reply.thread
      if (!thread) {
        return
      }
      thread.contextValue = undefined
      thread.collapsibleState = vscode.CommentThreadCollapsibleState.Collapsed
      if (reply.text) {
        const newComment = new NoteComment(
          reply.text,
          vscode.CommentMode.Preview,
          { name: 'vscode' },
          thread,
        )
        thread.comments = [...thread.comments, newComment].map((comment) => {
          comment.label = undefined
          return comment
        })
      }
    },
  ),
  deleteNoteComment: vscode.commands.registerCommand(
    Commands.CommentDeleteNoteComment,
    (comment: NoteComment) => {
      const thread = comment.parent
      if (!thread) {
        return
      }
      thread.comments = thread.comments.filter(
        (cmt) => (cmt as NoteComment).id !== comment.id,
      )
      if (thread.comments.length === 0) {
        thread.dispose()
      }
    },
  ),
  deleteNote: vscode.commands.registerCommand(
    Commands.CommentDeleteNote,
    (thread: vscode.CommentThread) => {
      thread.dispose()
    },
  ),
  cancelSaveNote: vscode.commands.registerCommand(
    Commands.CommentCancelSaveNote,
    (comment: NoteComment) => {
      if (!comment.parent) {
        return
      }
      comment.parent.comments = comment.parent.comments.map((cmt) => {
        if ((cmt as NoteComment).id === comment.id) {
          cmt.body = (cmt as NoteComment).savedBody
          cmt.mode = vscode.CommentMode.Preview
        }
        return cmt
      })
    },
  ),
  saveNote: vscode.commands.registerCommand(
    Commands.CommentSaveNote,
    (comment: NoteComment) => {
      if (!comment.parent) {
        return
      }
      comment.parent.comments = comment.parent.comments.map((cmt) => {
        if ((cmt as NoteComment).id === comment.id) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(cmt as NoteComment).savedBody = cmt.body
          cmt.mode = vscode.CommentMode.Preview
        }
        return cmt
      })
    },
  ),
  editNote: vscode.commands.registerCommand(
    Commands.CommentEditNote,
    (comment: NoteComment) => {
      if (!comment.parent) {
        return
      }
      comment.parent.comments = comment.parent.comments.map((cmt) => {
        if ((cmt as NoteComment).id === comment.id) {
          cmt.mode = vscode.CommentMode.Editing
        }
        return cmt
      })
    },
  ),
}
