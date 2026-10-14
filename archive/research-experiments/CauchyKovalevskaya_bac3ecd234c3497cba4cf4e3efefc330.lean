/-
  CauchyKovalevskaya.lean
  ══════════════════════════════════════════════════════════════════════════════
  A self-contained Lean 4 / Mathlib4 formalisation of the
  Cauchy–Kovalevskaya (CK) theorem for the first-order quasi-linear system

      ∂ₜu = Σᵢ Aᵢ(t, x, u) ∂ₓᵢu + b(t, x, u),   u|_{t=0} = 0,

  where t ∈ ℝ, x ∈ ℝⁿ, u : ℝ × ℝⁿ → ℝᵐ, and Aᵢ, b are analytic at 0.

  ──────────────────────────────────────────────────────────────────────────────
  Proof strategy (classical analytic majorisation / Cauchy–Kowalewsky):
    1. Uniqueness  – power-series coefficients are uniquely determined by the
                     recurrence derived from the PDE.
    2. Existence   – the coefficient norms are dominated by the coefficients of
                     a scalar majorising ODE whose explicit analytic solution
                     gives an upper bound on the radius of convergence.

  ──────────────────────────────────────────────────────────────────────────────
  Lean / Mathlib conventions used:
  • Types          : `EuclideanSpace ℝ (Fin n)` for ℝⁿ, `Fin m → ℝ` for ℝᵐ.
  • Analyticity    : `AnalyticAt ℝ f x` from Mathlib.Analysis.Analytic.Basic.
  • Power series   : `FormalMultilinearSeries`, `HasFPowerSeriesAt`.
  • Derivatives    : `HasFDerivAt`, `fderiv`.
  • Metric balls   : `Metric.ball`, `EMetric.ball`.

  Because the full analytic-PDE infrastructure is not yet in Mathlib (as of
  Mathlib4 2026), several steps are carried as *axioms / sorry-stubs* whose
  mathematical content is carefully stated; every such stub is labelled
  `[SORRY]` with a proof-sketch comment.
  ══════════════════════════════════════════════════════════════════════════════
-/

import Mathlib.Analysis.Analytic.Basic
import Mathlib.Analysis.Analytic.Composition
import Mathlib.Analysis.Analytic.Linear
import Mathlib.Analysis.Calculus.FDeriv.Basic
import Mathlib.Analysis.Calculus.FDeriv.Comp
import Mathlib.Analysis.NormedSpace.Basic
import Mathlib.RingTheory.PowerSeries.Basic
import Mathlib.Topology.MetricSpace.Basic
import Mathlib.Data.Fintype.Basic
import Mathlib.Data.Real.Basic
import Mathlib.Tactic

open scoped NNReal ENNReal Topology
open Filter Metric FormalMultilinearSeries

noncomputable section

-- ============================================================================
-- §1  NOTATION AND BASIC TYPES
-- ============================================================================

/-- Dimension of the PDE "space" variable x ∈ ℝⁿ. -/
variable (n m : ℕ) [NeZero n] [NeZero m]

/-- The spatial variable lives in ℝⁿ, the unknown u lives in ℝᵐ. -/
abbrev SpaceVar := EuclideanSpace ℝ (Fin n)
abbrev SolVal   := EuclideanSpace ℝ (Fin m)

/-- The phase space for (x, u) ∈ ℝⁿ × ℝᵐ. -/
abbrev Phase := SpaceVar n × SolVal m

-- ============================================================================
-- §2  DATA OF THE CAUCHY PROBLEM
-- ============================================================================

/--
  `CKData n m` packages all coefficient functions for the first-order
  quasi-linear system

      ∂ₜu(t,x) = Σᵢ Aᵢ(t,x,u) · ∂ₓᵢ u(t,x) + b(t,x,u),

  with initial condition  u(0, x) = 0  (WLOG by translation).

  Fields:
  • `A i`  – the i-th matrix-valued coefficient  (ℝ → Phase n m → SolVal n m → SolVal n m)
             represented as a linear map  SolVal m → SolVal m  (i.e. an m×m matrix).
  • `b`    – the source term  ℝ × Phase n m → SolVal m.
-/
structure CKData (n m : ℕ) where
  /-- Matrix-valued coefficients Aᵢ : ℝ × Phase → End(ℝᵐ), i = 0 … n−1. -/
  A : Fin n → ℝ × Phase n m → SolVal m →L[ℝ] SolVal m
  /-- Source term b : ℝ × Phase → ℝᵐ. -/
  b : ℝ × Phase n m → SolVal m

/--
  `CKData.AnalyticAt0` states that all coefficient functions are analytic
  at the origin (0, 0, 0) ∈ ℝ × ℝⁿ × ℝᵐ.
-/
structure CKData.AnalyticAt0 (d : CKData n m) : Prop where
  A_analytic : ∀ i : Fin n,
    AnalyticAt ℝ (fun p : ℝ × Phase n m => (d.A i p).toFun) (0, 0, 0)
  b_analytic :
    AnalyticAt ℝ d.b (0, 0, 0)

-- ============================================================================
-- §3  NOTION OF SOLUTION
-- ============================================================================

/--
  `IsSolutionOf d r u` asserts that  u : ℝ × SpaceVar n → SolVal m  satisfies:
  (i)  u is analytic on the cylinder  {|t| < r, ‖x‖ < r};
  (ii) u satisfies the PDE pointwise;
  (iii) u satisfies the initial condition u(0,·) = 0.
-/
structure IsSolutionOf (d : CKData n m) (r : ℝ) (u : ℝ × SpaceVar n → SolVal m) : Prop where
  /-- Analyticity on the open cylinder. -/
  analytic : AnalyticOnNhd ℝ u (Metric.ball (0 : ℝ × SpaceVar n) r)
  /-- PDE satisfied pointwise on the cylinder. -/
  pde : ∀ t : ℝ, ∀ x : SpaceVar n,
      (t, x) ∈ Metric.ball (0 : ℝ × SpaceVar n) r →
      -- ∂ₜu(t,x) = Σᵢ Aᵢ(t,x,u(t,x)) · ∂ₓᵢu(t,x) + b(t,x,u(t,x))
      HasDerivAt (fun s => u (s, x)) (
          (∑ i : Fin n, (d.A i (t, x, u (t, x))) (
            fderiv ℝ (fun y => u (t, y)) x (EuclideanSpace.basisFun (Fin n) ℝ i)))
        + d.b (t, x, u (t, x))) t
  /-- Initial condition. -/
  init : ∀ x : SpaceVar n, u (0, x) = 0

-- ============================================================================
-- §4  FORMAL POWER SERIES RECURRENCE (UNIQUENESS ENGINE)
-- ============================================================================

/--
  Formal power series solution indexed by multi-index α ∈ ℕⁿ⁺¹ (time + space).
  We encode α = (α₀, α₁, …, αₙ) as an element of `Fin (n+1) → ℕ`.
-/
abbrev MultiIndex (n : ℕ) := Fin (n + 1) → ℕ

/-- Total degree of a multi-index. -/
def MultiIndex.deg {n : ℕ} (α : MultiIndex n) : ℕ := ∑ i, α i

/-- Multi-index factorial: α! = ∏ᵢ (αᵢ)! -/
def MultiIndex.factorial {n : ℕ} (α : MultiIndex n) : ℕ :=
  ∏ i, (α i).factorial

/--
  Coefficient recurrence for the formal power-series solution.

  Given that u = Σ_α cα · (t,x)^α / α!, the PDE translates into an explicit
  recurrence:

      α₀ · cα = R(c_{β : β < α}),      α₀ := α(0) (time component)

  where R involves only coefficients with strictly lower total degree.  This
  means every coefficient is uniquely determined from the initial data cα = 0
  whenever α₀ = 0 (initial condition).

  The following proposition states the recurrence precisely.
-/
/--
  `psCoeff d α` is the Taylor coefficient of the formal power series solution
  at multi-index α.  It is defined by the recurrence derived from the PDE.
-/
noncomputable def psCoeff (d : CKData n m) : MultiIndex n → SolVal m
  | α =>
    -- Base case: initial condition forces all spatial-only coefficients to 0.
    if α 0 = 0 then 0
    else
      -- Recurrence: coefficient at α is determined by lower-order coefficients.
      -- [SORRY] Full symbolic recurrence omitted; see proof sketch below.
      sorry

/--
  **Lemma (Uniqueness of formal series).**
  The formal power series coefficients of any analytic solution to the CK
  system with zero initial data are uniquely determined by the recurrence.
  In particular, there is *at most one* analytic solution.

  Proof sketch (classical):
  ─────────────────────────
  Suppose u is any analytic solution.  Write u = Σ_α (∂^α u / α!)|_{0} · (t,x)^α.
  Differentiating the PDE k times with respect to t and setting t = 0,
  the left-hand side gives (k+1)-th order time derivatives of u at 0,
  while the right-hand side involves only derivatives of order ≤ k.
  Induction on the total order shows every coefficient equals `psCoeff d α`.
-/
theorem psCoeff_unique (d : CKData n m) (hd : d.AnalyticAt0 n m)
    (r : ℝ) (hr : 0 < r)
    (u : ℝ × SpaceVar n → SolVal m) (hu : IsSolutionOf n m d r u)
    (α : MultiIndex n) :
    -- The α-th Taylor coefficient of u at 0 equals psCoeff d α.
    (fun β : MultiIndex n =>
      iteratedFDeriv ℝ (MultiIndex.deg α) u 0
        (fun _ => (1 : ℝ × SpaceVar n))) 0 =  -- placeholder for ∂^α u|₀ / α!
    psCoeff n m d α := by
  -- [SORRY] Induction on deg α using the PDE recurrence.
  sorry

-- ============================================================================
-- §5  MAJORISING SERIES (EXISTENCE ENGINE)
-- ============================================================================

/--
  **Definition (Majorant).**
  A formal power series P = Σ Cα Xᵅ *majorises* Q = Σ cα Xᵅ if
  ‖cα‖ ≤ Cα for all α.
-/
def Majorises (C c : MultiIndex n → ℝ) : Prop :=
  ∀ α, c α ≤ C α

/--
  The classical Cauchy majorant for CK: given that the analytic coefficient
  functions are bounded by M on a polydisk of radius ρ, i.e.,
  ‖Aᵢ(t,x,u)‖, ‖b(t,x,u)‖ ≤ M / (1 − (t+|x|+|u|)/ρ),
  we use the scalar ODE

      dW/dt = n·M / (1 − (t + W)/ρ),   W(0) = 0,

  whose explicit analytic solution is

      W(t) = ρ(1 − √(1 − 2nM t/ρ)).           (*)

  This converges for |t| < ρ/(2nM), giving the radius of the CK solution.
-/

/-- The majorant scalar ODE right-hand side. -/
noncomputable def majorantRHS (M ρ : ℝ) (t W : ℝ) : ℝ :=
  n * M / (1 - (t + W) / ρ)

/--
  Explicit solution of the majorant scalar ODE.

      W(t) = ρ · (1 − √(1 − 2nMt/ρ))
-/
noncomputable def majorantSol (M ρ : ℝ) (t : ℝ) : ℝ :=
  ρ * (1 - Real.sqrt (1 - 2 * n * M * t / ρ))

/--
  **Lemma (Majorant ODE solved).**
  `W = majorantSol n M ρ` satisfies `dW/dt = majorantRHS n M ρ t W` with
  initial condition W(0) = 0, for t in a neighbourhood of 0.
-/
theorem majorantSol_satisfies_ODE (M ρ : ℝ) (hM : 0 < M) (hρ : 0 < ρ) :
    let W := majorantSol n M ρ
    W 0 = 0 ∧
    ∀ t : ℝ, |t| < ρ / (2 * n * M) →
      HasDerivAt W (majorantRHS n M ρ t (W t)) t := by
  constructor
  · -- W(0) = ρ·(1 − √1) = 0
    simp [majorantSol, Real.sqrt_one]
    ring
  · intro t ht
    -- [SORRY]  Chain rule for real sqrt; straightforward calculus.
    -- The derivative of ρ(1 − √(1 − 2nMt/ρ)) is
    --   ρ · (−1/(2√·)) · (−2nM/ρ) = nM/√(1−2nMt/ρ)
    -- which equals nM/((1 − (t + W(t))/ρ)) after substituting W.
    sorry

/--
  **Lemma (Majorant analyticity).**
  `majorantSol n M ρ` is analytic at 0 (on the disk |t| < ρ/(2nM)).
-/
theorem majorantSol_analyticAt (M ρ : ℝ) (hM : 0 < M) (hρ : 0 < ρ) :
    AnalyticAt ℝ (majorantSol n M ρ) 0 := by
  -- [SORRY]  Composition of analytic functions: 1 − 2nMt/ρ is analytic,
  -- Real.sqrt is analytic away from 0 (and equals a convergent power series
  -- √(1−s) = Σ bₖ sᵏ for |s|<1 via binomial series), and ρ·(1−·) is linear.
  sorry

-- ============================================================================
-- §6  COEFFICIENT NORM ESTIMATES (MAJORISATION)
-- ============================================================================

/--
  `majorantCoeff n M ρ k` is the k-th Taylor coefficient of the majorant scalar
  solution  W(t) = ρ(1 − √(1 − 2nMt/ρ)).

  Expanding by the binomial series  √(1−s) = Σ_{k≥0} (-1)^k C(1/2,k) s^k,
  with s = 2nMt/ρ:

      W(t) = ρ · Σ_{k≥1} (-1)^{k+1} C(1/2,k) (2nM/ρ)^k t^k / k!  · k!

  (re-expanded as a Taylor series in t).
-/
noncomputable def majorantCoeff (M ρ : ℝ) (k : ℕ) : ℝ :=
  if k = 0 then 0
  else
    ρ * ((-1 : ℝ)^(k+1) *
        (∏ i : Fin k, ((1 : ℝ)/2 - i)) / (k.factorial : ℝ)) *
        (2 * n * M / ρ)^k

/--
  **Lemma (Majorisation of coefficients).**
  For any analytic solution u of the CK system, the norm of the k-th
  iterated time-derivative of u at 0 is bounded by `majorantCoeff n M ρ k`.

  This is the core estimate: the scalar majorant dominates the vector
  solution coefficient by coefficient.

  Proof sketch:
  ─────────────
  By induction on k using the recurrence from §4.
  At each step the recurrence gives a linear combination of products of
  previous coefficients, with coefficients bounded by the analytic data.
  The scalar recurrence for `majorantCoeff` is the same recurrence but with
  all coefficient norms replaced by M and all radii replaced by ρ, so the
  bound propagates by induction.
-/
theorem majorant_dominates (d : CKData n m) (hd : d.AnalyticAt0 n m)
    (M ρ : ℝ) (hM : 0 < M) (hρ : 0 < ρ)
    -- Bound on analytic data:
    (hbound : ∀ i : Fin n, ∀ p : ℝ × Phase n m,
        ‖p‖ < ρ → ‖(d.A i p).toFun‖ ≤ M / (1 - ‖p‖ / ρ))
    (hbound_b : ∀ p : ℝ × Phase n m,
        ‖p‖ < ρ → ‖d.b p‖ ≤ M / (1 - ‖p‖ / ρ))
    (r : ℝ) (hr : 0 < r) (u : ℝ × SpaceVar n → SolVal m)
    (hu : IsSolutionOf n m d r u) (k : ℕ) :
    ‖iteratedFDeriv ℝ k (fun t => u (t, 0)) 0 (fun _ => (1 : ℝ))‖ ≤
    majorantCoeff n M ρ k := by
  -- [SORRY]  Induction on k; the recurrence from §4 gives the bound.
  induction k with
  | zero =>
    simp [majorantCoeff, iteratedFDeriv_zero_apply]
    -- u(0,0) = 0 from initial condition.
    have := hu.init 0
    simp [this]
  | succ k ih =>
    -- [SORRY]  Use PDE recurrence + Leibniz rule + bound on Aᵢ, b.
    sorry

-- ============================================================================
-- §7  CONVERGENCE OF THE FORMAL SERIES
-- ============================================================================

/--
  **Lemma (Radius of convergence).**
  The formal power series with coefficients `psCoeff d α` converges
  (absolutely and uniformly) on the cylinder

      { (t,x) : |t| + ‖x‖ < ρ/(2nM) }.

  Proof sketch:
  ─────────────
  From §6, ‖psCoeff d α‖ ≤ (majorantCoeff corresponding to |α|).
  The scalar series converges on |t| < ρ/(2nM) (since `majorantSol` is
  analytic there).  By a standard comparison / Weierstrass M-test the
  vector series converges on the same domain.
-/
theorem formal_series_converges (d : CKData n m) (hd : d.AnalyticAt0 n m)
    (M ρ : ℝ) (hM : 0 < M) (hρ : 0 < ρ)
    (hbound : ∀ i : Fin n, ∀ p : ℝ × Phase n m,
        ‖p‖ < ρ → ‖(d.A i p).toFun‖ ≤ M / (1 - ‖p‖ / ρ))
    (hbound_b : ∀ p : ℝ × Phase n m,
        ‖p‖ < ρ → ‖d.b p‖ ≤ M / (1 - ‖p‖ / ρ)) :
    ∃ r : ℝ, 0 < r ∧
    -- The formal power series Σ_α psCoeff(α) · (t,x)^α/α! defines an
    -- analytic function on ball(0, r).
    ∃ u : ℝ × SpaceVar n → SolVal m,
      AnalyticOnNhd ℝ u (Metric.ball (0 : ℝ × SpaceVar n) r) := by
  -- [SORRY]  Take r = ρ/(4nM) (half the majorant radius for safety margin).
  -- The absolute convergence follows from §6 + ratio/comparison with the
  -- scalar majorant series.
  refine ⟨ρ / (4 * ↑n * M), by positivity, ?_⟩
  sorry

-- ============================================================================
-- §8  MAIN THEOREM: CAUCHY–KOVALEVSKAYA
-- ============================================================================

/--
  ## Theorem: Cauchy–Kovalevskaya (First-Order Quasi-Linear System)

  **Statement.**  Let  d : CKData n m  be a first-order quasi-linear PDE system
  whose coefficients Aᵢ and b are analytic at the origin.  Then there exists
  a radius r > 0 and a unique analytic function

      u : ℝ × ℝⁿ → ℝᵐ

  defined on the cylinder { (t, x) : |(t, x)| < r } that satisfies:

      ∂ₜu(t,x) = Σᵢ Aᵢ(t,x,u(t,x)) · ∂ₓᵢ u(t,x) + b(t,x,u(t,x))

  with initial condition u(0, x) = 0.

  **Proof outline:**
  1. *Uniqueness* (§4):  Any two analytic solutions have the same formal Taylor
     coefficients (by the recurrence `psCoeff`), hence they are equal on their
     common domain of analyticity.
  2. *Existence* (§5–§7):  The formal series Σ `psCoeff d α` · (t,x)^α/α!
     converges on the cylinder |t|+‖x‖ < ρ/(2nM) because it is dominated
     coefficient-by-coefficient (§6) by the scalar majorant `majorantSol`,
     which is analytic on that disk (§5).  The sum of this series defines an
     analytic function that satisfies the PDE by construction.
-/
theorem cauchy_kovalevskaya
    (d : CKData n m)
    (hd : d.AnalyticAt0 n m) :
    ∃ r : ℝ, 0 < r ∧
    ∃! u : ℝ × SpaceVar n → SolVal m,
      IsSolutionOf n m d r u := by
  -- ── Step A: obtain analytic coefficient bounds (Cauchy estimates) ──────────
  -- Because Aᵢ and b are analytic at 0, there exist M, ρ > 0 such that
  -- the Cauchy–Hadamard bounds hold on Bρ.
  obtain ⟨M, ρ, hM, hρ, hbound, hbound_b⟩ : ∃ M ρ : ℝ, 0 < M ∧ 0 < ρ ∧
      (∀ i : Fin n, ∀ p : ℝ × Phase n m,
        ‖p‖ < ρ → ‖(d.A i p).toFun‖ ≤ M / (1 - ‖p‖ / ρ)) ∧
      (∀ p : ℝ × Phase n m,
        ‖p‖ < ρ → ‖d.b p‖ ≤ M / (1 - ‖p‖ / ρ)) := by
    -- [SORRY]  Standard consequence of analyticity: analytic functions are
    -- locally bounded, and the Cauchy integral formula gives these polynomial
    -- majorant bounds.  See e.g. John "Partial Differential Equations" §3.
    sorry
  -- ── Step B: convergence of formal series gives existence radius ────────────
  obtain ⟨r, hr, u, hu_analytic⟩ :=
    formal_series_converges n m d hd M ρ hM hρ hbound hbound_b
  -- ── Step C: the converging series is a solution ────────────────────────────
  have hu_sol : IsSolutionOf n m d r u := by
    -- [SORRY]  Verify PDE and initial condition from the recurrence relation
    -- satisfied by the coefficients (term-by-term differentiation of the
    -- convergent series is justified by uniform convergence on compact subsets).
    sorry
  -- ── Step D: uniqueness ─────────────────────────────────────────────────────
  have hu_unique : ∀ v : ℝ × SpaceVar n → SolVal m,
      IsSolutionOf n m d r v → v = u := by
    intro v hv
    -- Any two analytic solutions share all Taylor coefficients (Lemma §4),
    -- so they agree on the ball of convergence by analyticity.
    funext p
    -- [SORRY]  Apply psCoeff_unique for each multi-index α and sum the series.
    sorry
  -- ── Conclusion ────────────────────────────────────────────────────────────
  exact ⟨r, hr, u, hu_sol, hu_unique⟩

-- ============================================================================
-- §9  COROLLARY: HIGHER-ORDER REDUCTION
-- ============================================================================

/--
  **Corollary (Higher-order CK).**
  A k-th order analytic PDE system

      ∂ₜᵏ u = F(t, x, (∂^α u)_{|α|+j≤k, j<k})

  with analytic F can be reduced to the first-order system of §8 by
  introducing the derivatives of u up to order k−1 as new unknowns.
  Hence it also has a unique local analytic solution.

  The reduction is standard: let
      vⱼ = ∂ₜʲ u  (j = 0, …, k−1).
  Then ∂ₜ vⱼ = vⱼ₊₁ for j < k−1 and ∂ₜ vₖ₋₁ = F(…).
  The resulting first-order system is quasi-linear (linear in ∂ₓ), so
  `cauchy_kovalevskaya` applies.
-/
theorem cauchy_kovalevskaya_higher_order
    (k : ℕ) (hk : 0 < k)
    -- F : analytic nonlinearity
    (F : ℝ × SpaceVar n × (Fin k → SolVal m) → SolVal m)
    (hF : AnalyticAt ℝ F 0) :
    ∃ r : ℝ, 0 < r ∧
    ∃! u : ℝ × SpaceVar n → SolVal m,
      -- u is analytic on the cylinder
      AnalyticOnNhd ℝ u (Metric.ball (0 : ℝ × SpaceVar n) r) ∧
      -- u satisfies the k-th order PDE and zero initial data ∂ₜʲ u|_{t=0} = 0
      (∀ j : Fin k, ∀ x : SpaceVar n,
        iteratedFDeriv ℝ j.val (fun t => u (t, x)) 0 (fun _ => 1) = 0) := by
  -- [SORRY]  Reduction to first-order via auxiliary variables + apply
  -- cauchy_kovalevskaya.
  sorry

-- ============================================================================
-- §10  COROLLARY: KOVALEVSKAYA COUNTEREXAMPLE (NECESSITY OF ANALYTICITY)
-- ============================================================================

/--
  **Kovalevskaya counterexample.**
  The heat equation  ∂ₜu = ∂ₓ²u  with *analytic* initial data
  u(0,x) = 1/(1+x²) has no analytic solution near any (0, x₀).

  This shows that the analyticity assumption on the *initial data* (and not
  only the coefficients) is essential for the CK theorem.

  [Historical note: the standard version of the example uses u(0,x) = 1/(1−x²)
  or similar; the point is that the formal power series diverges for t ≠ 0.]
-/
theorem kovalevskaya_counterexample :
    -- Formal power series solution of ∂ₜu = ∂ₓ²u, u(0,x) = Σ c_k x^{2k}
    -- with c_k = (−1)^k has zero radius of convergence for t ≠ 0.
    ∀ t : ℝ, t ≠ 0 →
      ¬ Summable (fun k : ℕ =>
          ((-1 : ℝ)^k * (2*k).factorial / k.factorial) * t^k) := by
  -- [SORRY]  Ratio test: ratio of successive terms ~ 4k·|t| → ∞.
  intro t ht
  sorry

-- ============================================================================
-- §11  AUXILIARY LEMMAS (analytic function toolkit)
-- ============================================================================

namespace AnalyticCK

/-- Sum of finitely many analytic functions is analytic. -/
lemma analyticAt_sum {E F : Type*} [NormedAddCommGroup E] [NormedSpace ℝ E]
    [NormedAddCommGroup F] [NormedSpace ℝ F] [CompleteSpace F]
    {ι : Type*} (s : Finset ι) {f : ι → E → F} {x : E}
    (hf : ∀ i ∈ s, AnalyticAt ℝ (f i) x) :
    AnalyticAt ℝ (fun y => ∑ i ∈ s, f i y) x := by
  induction s using Finset.induction_on with
  | empty => simp [analyticAt_const]
  | insert ha ih =>
    simp only [Finset.sum_insert ha]
    apply AnalyticAt.add
    · exact hf _ (Finset.mem_insert_self _ _)
    · exact ih (fun i hi => hf i (Finset.mem_insert_of_mem hi))

/-- Composition of analytic maps is analytic. -/
lemma analyticAt_comp {E F G : Type*}
    [NormedAddCommGroup E] [NormedSpace ℝ E]
    [NormedAddCommGroup F] [NormedSpace ℝ F] [CompleteSpace F]
    [NormedAddCommGroup G] [NormedSpace ℝ G] [CompleteSpace G]
    {f : F → G} {g : E → F} {x : E}
    (hf : AnalyticAt ℝ f (g x)) (hg : AnalyticAt ℝ g x) :
    AnalyticAt ℝ (f ∘ g) x :=
  hf.comp hg

/--
  If u : ℝ × SpaceVar n → SolVal m is analytic, then so is each
  "time-slice" x ↦ u(t₀, x) for fixed t₀.
-/
lemma analyticAt_time_slice
    {u : ℝ × SpaceVar n → SolVal m}
    {t₀ : ℝ} {x₀ : SpaceVar n}
    (hu : AnalyticAt ℝ u (t₀, x₀)) :
    AnalyticAt ℝ (fun x => u (t₀, x)) x₀ := by
  have : AnalyticAt ℝ (fun x : SpaceVar n => (t₀, x)) x₀ :=
    (analyticAt_const.prod analyticAt_id)
  exact hu.comp this

/--
  Cauchy estimates: if f is analytic on ball(x,r) and ‖f‖ ≤ M there, then
  the n-th coefficient satisfies ‖pₙ‖ ≤ M / rⁿ.
-/
lemma cauchy_estimate {E F : Type*} [NormedAddCommGroup E] [NormedSpace ℝ E]
    [NormedAddCommGroup F] [NormedSpace ℝ F] [CompleteSpace F]
    {f : E → F} {p : FormalMultilinearSeries ℝ E F}
    {x : E} {r : ℝ} (hr : 0 < r) {M : ℝ} (hM : 0 < M)
    (hfp : HasFPowerSeriesOnBall f p x (ENNReal.ofReal r))
    (hbound : ∀ y : E, ‖y - x‖ < r → ‖f y‖ ≤ M) :
    ∀ n : ℕ, ‖p n‖ ≤ M / r ^ n := by
  -- [SORRY]  Standard Cauchy estimate via Cauchy integral formula or
  -- direct norm bound from the power series definition.
  sorry

end AnalyticCK

-- ============================================================================
-- §12  SUMMARY OF `sorry`-STUBS
-- ============================================================================

/-
  The following `sorry`s appear in this file.  Each is a well-defined
  mathematical claim; we document the standard proof strategy.

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ Location                   │ Standard proof                              │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ psCoeff (definition)       │ Well-founded recursion on deg α; the RHS    │
  │                            │ depends only on β with deg β < deg α.       │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ psCoeff_unique             │ Induction on deg α; differentiate PDE k     │
  │                            │ times in t, evaluate at t=0.                │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ majorantSol_satisfies_ODE  │ Chain rule for √(1−2nMt/ρ), valid for       │
  │                            │ |t| < ρ/(2nM) where argument is positive.   │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ majorantSol_analyticAt     │ Binomial series √(1−s) = Σ C(1/2,k)(-s)^k  │
  │                            │ converges for |s|<1; compose with 2nMt/ρ.   │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ majorant_dominates (succ)  │ Induction: PDE recurrence + Leibniz rule +   │
  │                            │ triangle inequality + Aᵢ/b bounds.           │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ formal_series_converges    │ Weierstrass M-test: ‖coeff‖ ≤ majorant coeff│
  │                            │ + majorant series converges on |t|<ρ/(2nM). │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ cauchy_kovalevskaya        │ Steps A–D in §8; each is a sub-result above. │
  │ (Steps A, C, D)            │                                              │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ cauchy_kovalevskaya_       │ Introduce vⱼ = ∂ₜʲu as new unknowns,        │
  │ higher_order               │ apply first-order CK theorem.               │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ kovalevskaya_counterexample│ Ratio test: aₖ₊₁/aₖ ~ 4k|t| → ∞ for t≠0.  │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ cauchy_estimate            │ Norm of n-th coefficient ≤ sup‖f‖ / rⁿ;     │
  │                            │ follows from HasFPowerSeriesOnBall.          │
  └──────────────────────────────────────────────────────────────────────────┘
-/

end -- noncomputable section
