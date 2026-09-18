import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import LineGraph from './LineGraph.vue'
import { it, vi, expect, describe, beforeEach } from 'vitest'

const resizeObserver = vi.fn()

class ResizeObserverMock {
  constructor(private readonly callback: ResizeObserverCallback) {
    resizeObserver.mockImplementation(() => this)
  }

  observe() {
    this.callback(
      [
        {
          contentRect: {
            width: 200,
            height: 100
          }
        }
      ] as ResizeObserverEntry[],
      this as unknown as ResizeObserver
    )
  }

  unobserve() {}
}

describe('LineGraph', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  it('renders a point when one of its coordinates is zero', async () => {
    const wrapper = mount(LineGraph, {
      attachTo: document.body,
      props: {
        data: [
          [0, 10],
          [1, 20],
          [2, 15]
        ]
      }
    })

    await nextTick()

    expect(wrapper.get('polyline').attributes('points')).toBe(
      ' 0,100 100,0 200,50'
    )
  })
})
