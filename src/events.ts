import _debounce from 'lodash.debounce'

const threshold = 400
const timeout = 200
const blockTimeout = 600

let change: number = 0
let blocked: boolean = false

let call: ((direction: number) => void) | null = null

let root: HTMLDivElement | null = null

const innerState = {
  attached: false
}

const reset = () => {
  if (blocked) {
    // fn was already called manually
    return
  }
  blocked = true
  change = 0

  setTimeout(() => {
    blocked = false
  }, blockTimeout)
}

const debounced = _debounce(reset, timeout)

const handleWheel = (ev: WheelEvent) => {
  if (blocked) {
    return
  }
  change += ev.deltaY

  if (change > threshold) {
    reset()
    call!(1)
  } else if (change < -threshold) {
    reset()
    call!(-1)
  }

  debounced()
}

const handleSwipe = (ev: any) => {
  if (ev.detail.dir === 'up') {
    call!(1)
  } else if (ev.detail.dir === 'down') {
    call!(-1)
  }
}

const add = ({
  rootEl,
  triggerFn
}: {
  rootEl: HTMLDivElement
  triggerFn: (direction: number) => void
}): void => {
  root = rootEl
  call = triggerFn

  if (!call) {
    throw new TypeError('Bad fn provided')
  }

  root.addEventListener('wheel', handleWheel)
  root.addEventListener('swiped', handleSwipe)
  innerState.attached = true
}

const remove = (): void => {
  root?.removeEventListener('wheel', handleWheel)
  root?.removeEventListener('swiped', handleSwipe)
  innerState.attached = false
}

const state = innerState

export { add, remove, state }
