from .ball import Ball
from .constants import SCREEN_WIDTH, SCREEN_HEIGHT, Position


class Paddle:
    PADDLE_SPEED: float = 0.05
    PADDLE_DEFAULT_WIDTH: float = 0.1
    PADDLE_DEFAULT_HEIGHT: float = 0.5

    def __init__(
        self,
        pos: Position,
        speed: float = PADDLE_SPEED,
        width: float = PADDLE_DEFAULT_WIDTH,
        height: float = PADDLE_DEFAULT_HEIGHT,
    ) -> None:
        self._pos: Position = pos
        self._speed: float = speed
        self._width: float = width
        self._height: float = height
        self._x: float = SCREEN_WIDTH / 2 * 0.933 * pos.value
        self._y: float = 0

        self.reset()

    def reset(self) -> None:
        self._y = 0

    def move_paddle_up(self) -> None:
        self._y += self._speed
        if SCREEN_HEIGHT / 2 < self._y + self._height / 2:
            self._y = SCREEN_HEIGHT / 2 - self._height / 2

    def move_paddle_down(self) -> None:
        self._y -= self._speed
        if self._y - self._height / 2 < -1 * SCREEN_HEIGHT / 2:
            self._y = -1 * (SCREEN_HEIGHT / 2 - self._height / 2)

    def is_collides_with_ball(self, ball: Ball) -> bool:
        """공과 패들의 충돌 여부를 반환"""
        ball_left_x: float = ball.x - ball.radius
        ball_right_x: float = ball.x + ball.radius
        ball_top_y: float = ball.y + ball.radius
        ball_bottom_y: float = ball.y - ball.radius

        paddle_left_x: float = self._x - self._width / 2
        paddle_right_x: float = self._x + self._width / 2
        paddle_top_y: float = self._y + self._height / 2
        paddle_bottom_y: float = self._y - self._height / 2

        if not (
            ball_left_x <= paddle_right_x <= ball_right_x
            or ball_left_x <= paddle_left_x <= ball_right_x
        ):
            return False

        if paddle_top_y < ball_bottom_y or ball_top_y < paddle_bottom_y:
            return False

        return (ball.dx < 0) == (self.pos < 0)

    @property
    def x(self) -> float:
        return self._x

    @x.setter
    def x(self, x) -> None:
        self._x = x

    @property
    def y(self) -> float:
        return self._y

    @y.setter
    def y(self, y) -> None:
        self._y = y

    @property
    def width(self) -> float:
        return self._width

    @property
    def height(self) -> float:
        return self._height

    @property
    def pos(self) -> int:
        return self._pos.value
