import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, ConfirmModal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Dependant } from '@/types'

const dependantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name too long'),
  relationship: z.string().max(40, 'Too long').default(''),
  isChild: z.boolean().default(false),
})

type DependantInput = z.input<typeof dependantSchema>

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function FamilySection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const dependants = user?.dependants || []

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Dependant | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<Dependant | null>(null)

  const form = useForm<DependantInput>({
    resolver: zodResolver(dependantSchema),
    defaultValues: { name: '', relationship: '', isChild: false },
  })

  const handleAdd = () => {
    setEditing(null)
    form.reset({ name: '', relationship: '', isChild: false })
    setIsOpen(true)
  }

  const handleEdit = (d: Dependant) => {
    setEditing(d)
    form.reset({ name: d.name, relationship: d.relationship || '', isChild: !!d.isChild })
    setIsOpen(true)
  }

  const handleSave = form.handleSubmit(async (data) => {
    try {
      const next: Dependant[] = editing
        ? dependants.map((d) =>
            d.id === editing.id
              ? { ...d, name: data.name.trim(), relationship: data.relationship?.trim() || '', isChild: data.isChild }
              : d,
          )
        : [
            ...dependants,
            { id: makeId(), name: data.name.trim(), relationship: data.relationship?.trim() || '', isChild: data.isChild },
          ]
      await updateProfile({ dependants: next })
      showToast(editing ? 'Family member updated' : 'Family member added', 'success')
      setIsOpen(false)
    } catch {
      showToast('Failed to save', 'error')
    }
  })

  const handleRemove = async () => {
    if (!confirmRemove) return
    try {
      const next = dependants.filter((d) => d.id !== confirmRemove.id)
      await updateProfile({ dependants: next })
      showToast('Removed', 'success')
      setConfirmRemove(null)
    } catch {
      showToast('Failed to remove', 'error')
    }
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta">Family</p>
        <Button variant="ghost" size="sm" onClick={handleAdd} aria-label="Add family member">
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {dependants.length === 0 ? (
        <div className="flex items-start gap-3 p-4 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] text-text-light text-sm">
          <Users size={18} className="mt-0.5 shrink-0" />
          <span>Add family members to RSVP for them in one go. Visible to you and admins by default; toggle privacy below to share with the directory.</span>
        </div>
      ) : (
        <ul className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc] list-none p-0 m-0">
          {dependants.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm m-0">{d.name}</p>
                <p className="text-xs text-text-light m-0">
                  {d.relationship || (d.isChild ? 'Child' : 'Family')}
                </p>
              </div>
              <button
                onClick={() => handleEdit(d)}
                className="p-2 rounded-md text-text-light hover:bg-cream/60 hover:text-text-primary transition-colors"
                aria-label={`Edit ${d.name}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setConfirmRemove(d)}
                className="p-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                aria-label={`Remove ${d.name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Family Member' : 'Add Family Member'}>
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <div>
            <label className="block font-medium mb-2" htmlFor="dep-name">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="dep-name"
              type="text"
              className={cn(inputBase, form.formState.errors.name && inputError)}
              placeholder="First name (or first + last)"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <span className="text-sm text-red-600 mt-1 block" role="alert">{form.formState.errors.name.message}</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="dep-rel">Relationship</label>
            <input
              id="dep-rel"
              type="text"
              className={inputBase}
              placeholder="e.g. Spouse, Son, Daughter, Parent"
              {...form.register('relationship')}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-[18px] h-[18px] accent-forest" {...form.register('isChild')} />
            <span>This person is a child</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
              {editing ? 'Save' : 'Add'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemove}
        title="Remove family member?"
        message={`Remove ${confirmRemove?.name || ''} from your family list?`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </section>
  )
}
