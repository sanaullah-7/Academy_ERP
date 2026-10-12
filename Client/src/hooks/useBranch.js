/**
 * Purpose: Will define use Branch for the hooks area of the Academy frontend.
 * Module: hooks
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { useContext } from 'react'
import { BranchContext } from '../contexts/accessContexts.js'
export function useBranch() { const context = useContext(BranchContext); if (!context) throw new Error('useBranch requires BranchProvider'); return context }
