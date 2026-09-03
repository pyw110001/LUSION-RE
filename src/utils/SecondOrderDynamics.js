/**
 * SecondOrderDynamics - Spring-mass-damper physical response
 * Used by Lusion for organic bouncy motion, camera tracking, and cursor lag.
 * Parameters:
 * f: frequency (speed of oscillation/reaction)
 * z: damping ratio (0 = infinite oscillation, 1 = critically damped, >1 = overdamped)
 * r: initial response (<0 = anticipatory, 0 = smooth start, 1 = immediate, >1 = overshoot)
 */
export class SecondOrderDynamics {
  constructor(initialValue, f = 1.5, z = 0.8, r = 2.0) {
    this.isVector = typeof initialValue === 'object' && initialValue !== null;

    if (this.isVector) {
      this.target = initialValue.clone();
      this.prevTarget = initialValue.clone();
      this.value = initialValue.clone();
      this.valueVel = initialValue.clone().setScalar(0);
    } else {
      this.target = initialValue;
      this.prevTarget = initialValue;
      this.value = initialValue;
      this.valueVel = 0;
    }

    this.setFZR(f, z, r);
  }

  setFZR(f, z, r) {
    this.f = f;
    this.z = z;
    this.r = r;
    const w = 2 * Math.PI * f;
    this.k1 = z / (Math.PI * f);
    this.k2 = 1 / (w * w);
    this.k3 = (r * z) / w;
  }

  update(dt, newTarget) {
    if (newTarget !== undefined) {
      if (this.isVector) {
        this.target.copy(newTarget);
      } else {
        this.target = newTarget;
      }
    }

    // Stable timestep clamp
    const clampedDt = Math.min(dt, 0.05);

    if (this.isVector) {
      // Calculate target velocity
      const targetVel = this.target.clone().sub(this.prevTarget).multiplyScalar(1 / (clampedDt || 0.016));
      this.prevTarget.copy(this.target);

      // Integrate second-order differential equation
      // value += dt * valueVel
      // valueVel += dt * (target + k3*targetVel - value - k1*valueVel) / k2
      const delta = this.target.clone()
        .addScaledVector(targetVel, this.k3)
        .sub(this.value)
        .addScaledVector(this.valueVel, -this.k1)
        .multiplyScalar(1 / this.k2);

      this.value.addScaledVector(this.valueVel, clampedDt);
      this.valueVel.addScaledVector(delta, clampedDt);
      return this.value;
    } else {
      const targetVel = (this.target - this.prevTarget) / (clampedDt || 0.016);
      this.prevTarget = this.target;

      const delta = (this.target + this.k3 * targetVel - this.value - this.k1 * this.valueVel) / this.k2;
      this.value += clampedDt * this.valueVel;
      this.valueVel += clampedDt * delta;
      return this.value;
    }
  }

  reset(val) {
    if (this.isVector) {
      this.target.copy(val);
      this.prevTarget.copy(val);
      this.value.copy(val);
      this.valueVel.setScalar(0);
    } else {
      this.target = val;
      this.prevTarget = val;
      this.value = val;
      this.valueVel = 0;
    }
  }
}
